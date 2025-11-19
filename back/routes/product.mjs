import { Router } from "express"
import { Product } from '../models/Product.mjs'
import { User } from '../models/User.mjs'
import jwt from 'jsonwebtoken'

export const productRoutes = Router()

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: true, msg: "Token no proporcionado o formato incorrecto (Debe ser Bearer token)" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).json({ error: true, msg: "Token inválido o expirado" })
    }
}

const handleSequelizeError = (err, res) => {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const msg = err.errors.map(e => e.message).join('. ')
        return res.status(400).json({ error: true, msg: msg })
    }
    console.error("Error inesperado en BD:", err)
    return res.status(500).json({ error: true, msg: "Ocurrió un error inesperado en el servidor." })
}

productRoutes.get("/", async function(req, res) {
    try {
        const products = await Product.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'fullName', 'email']
            }],
            order: [
                ['updatedAt', 'DESC']
            ]
        })
        res.json({
            error: false,
            data: products
        })
    } catch (error) {
        console.error("Error al cargar productos:", error)
        res.status(500).json({
            error: true,
            msg: "No se pudieron cargar los productos"
        })
    }
})

productRoutes.post('/', verifyToken, async (req, res) => {
    try {
        const body = req.body

        if (!body.name || !body.price || !body.stock) {
            return res.status(400).json({ error: true, msg: "Todos los campos son obligatorios" })
        }

        const product = new Product({
            name: body.name,
            price: Number(body.price),
            stock: Number(body.stock),
            userId: req.user.id
        })

        await product.save()
        return res.json({ error: false, msg: "Producto cargado" })
    } catch (err) {
        handleSequelizeError(err, res)
    }
})

productRoutes.get("/product", verifyToken, async (req, res) => {
    const query = req.query
    try {
        const product = await Product.findOne({
            where: { id: query.id },
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'fullName', 'email']
            }]
        })
        if (!product) {
            return res.status(404).json({ error: true, msg: "Producto no encontrado" })
        }
        res.json({ error: false, product: product })
    } catch {
        res.status(500).json({ error: true, msg: "Hubo un error en el servidor" })
    }
})

productRoutes.put("/", verifyToken, async (req, res) => {
    const query = req.query
    const body = req.body
    try {
        const product = await Product.findOne({ where: { id: query?.id } })

        if (!product) {
            return res.status(404).json({ error: true, msg: "No se puede actualizar, porque no existe" })
        }

        product.name = body.name
        product.stock = body.stock
        product.price = body.price
        await product.save()

        res.json({ error: false, msg: "Producto actualizado" })
    } catch (err) {
        handleSequelizeError(err, res)
    }
})

productRoutes.delete("/", verifyToken, async (req, res) => {
    const query = req.query
    try {
        const product = await Product.findByPk(query.id)

        if (!product) {
            return res.status(404).json({ error: true, msg: "Producto no encontrado" })
        }

        await product.destroy()
        res.json({ error: false, msg: "Producto eliminado" })
    } catch {
        res.status(500).json({ error: true, msg: "Ocurrio un error" })
    }
})

/**
 * POST /products/buy
 * Body: { cart: [{ id, qty }, ...] }
 * Requiere token (usuario)
 * Verifica stock y descuenta si todo OK.
 */
productRoutes.post('/buy', verifyToken, async (req, res) => {
    const { cart } = req.body
    if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: true, msg: "Carrito vacío o formato inválido" })
    }

    const tErrors = []
    const updates = []

    try {
        // verificar existencia y stock
        for (const item of cart) {
            const prod = await Product.findByPk(item.id)
            if (!prod) {
                tErrors.push(`Producto con id ${item.id} no encontrado`)
                continue
            }
            const newStock = Number(prod.stock) - Number(item.qty)
            if (newStock < 0) {
                tErrors.push(`Stock insuficiente para ${prod.name}`)
                continue
            }
            updates.push({ prod, newStock })
        }

        if (tErrors.length > 0) {
            return res.status(400).json({ error: true, msg: tErrors.join('; ') })
        }

        // si todo ok, actualizar stock (no transaction simple seq)
        for (const u of updates) {
            u.prod.stock = u.newStock
            await u.prod.save()
        }

        res.json({ error: false, msg: "Compra procesada (simulada) y stock actualizado" })
    } catch (err) {
        console.error("Error en buy:", err)
        res.status(500).json({ error: true, msg: "Error procesando la compra" })
    }
})

export default productRoutes
