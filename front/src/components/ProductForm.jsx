import { Button } from './Button'
import { useState, useEffect } from 'react'
import { toast } from "react-toastify"
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { FormHeader } from './iu/FormHeader'
import { FormInputWithError } from './iu/FormInputWithError'

export const ProductForm = () => {
    const { user } = useStore()
    const navigate = useNavigate()
    const params = useParams()
    
    const isEditing = (() => {
        if (params.id) {
            return true
        } else {
            return false
        }
    })()

    const initialId = (() => {
        if (params.id) {
            return params.id
        } else {
            return ""
        }
    })()

    const [id, setId] = useState(initialId)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [loading, setLoading] = useState(false) 
    
    const [errors, setErrors] = useState({}) 

    const authHeaders = {
        'content-type': "application/json",
        "accept": "application/json",
        'Authorization': user.token 
    }

    useEffect(() => {
        const getProduct = async () => {
            if (!isEditing) {
                return
            }
            try {
                const url = `${import.meta.env.VITE_API_URL}/products/product?id=${params.id}` 
                const config = { method: "GET", headers: authHeaders }
                const req = await fetch(url, config)
                const res = await req.json()
                
                if (res.error) {
                    toast.error(res.msg)
                    return
                }
                
                setName(res.product.name)
                setPrice(String(res.product.price)) 
                setStock(String(res.product.stock)) 
            } catch (err) {
                toast.error(`Error al cargar producto: ${err.message}`)
            }
        }
        if (user.token && isEditing) {
            getProduct()
        }
    }, [user.token, isEditing, params.id])

    const validateForm = () => {
        const newErrors = {}
        const parsedPrice = parseFloat(price)
        const parsedStock = parseInt(stock)

        if (!name.trim()) {
            newErrors.name = "El nombre del producto es obligatorio."
        }
        
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            newErrors.price = "El precio debe ser un número no negativo."
        } else if (parsedPrice > 1000000) { 
            newErrors.price = "El precio es excesivamente alto."
        }

        if (isNaN(parsedStock) || parsedStock < 1) {
            newErrors.stock = "La cantidad mínima debe ser 1."
        } else if (parsedStock !== Math.floor(parsedStock)) {
            newErrors.stock = "La cantidad debe ser un número entero."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 
    }
    
    const updateProduct = async () => {
        setLoading(true)
        try {
            const config = {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock) }) 
            }
            const url = `${import.meta.env.VITE_API_URL}/products/?id=${id}`
            const req = await fetch(url, config)
            const res = await req.json()
            if (res.error) {
                toast.error(res.msg)
                return
            }
            toast.success(res.msg)
            setTimeout(() => navigate("/private"), 700)
        } catch (er) {
            toast.error("Ha ocurrido un error al actualizar")
        } finally {
            setLoading(false)
        }
    }

    const createProduct = async () => {
        setLoading(true)
        try {
            const config = {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock) })
            }
            const url = `${import.meta.env.VITE_API_URL}/products`
            const req = await fetch(url, config)
            const res = await req.json()
            if (res.error) {
                toast.error(res.msg)
                return
            }
            toast.success(res.msg)
            setName("")
            setPrice("")
            setStock("")
        } catch (er) {
            toast.error("Ha ocurrido un error al crear")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Por favor, corrige los errores del formulario.")
            return
        }

        if (isEditing) {
            await updateProduct()
        } else {
            await createProduct()
        }
    }
    
    const handleChange = (setter, key) => (e) => {
        setter(e.target.value)
        
        if (errors[key]) {
            setTimeout(validateForm, 0) 
        }
    }

    const formTitle = (() => {
        if (isEditing) {
            return "Editar Producto"
        } else {
            return "Cargar Producto"
        }
    })()

    const buttonValue = (() => {
        if (loading) {
            return "Cargando..."
        } else if (isEditing) {
            return "Actualizar"
        } else {
            return "Cargar"
        }
    })()

    return (
        <div className='min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center py-12 px-4'>
            <div className='relative z-10 w-full flex flex-col items-center'>

                <FormHeader title={formTitle} />

                <form 
                    className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100" 
                    onSubmit={handleSubmit}
                >
                    
                    <FormInputWithError
                        type="text"
                        name="Nombre_Producto"
                        placeholder="Ingrese el producto"
                        value={name}
                        title="Nombre del Producto"
                        onChange={handleChange(setName, 'name')}
                        error={errors.name}
                    />

                    <FormInputWithError
                        type="number"
                        name="Precio"
                        placeholder="Ingrese el precio (Mínimo 0)"
                        value={price}
                        title="Precio"
                        onChange={handleChange(setPrice, 'price')}
                        step="0.01"
                        error={errors.price}
                    />

                    <FormInputWithError
                        name="Cantidad"
                        type="number"
                        placeholder="Ingrese la cantidad (Mínimo 1, entero)"
                        value={stock}
                        title="Stock"
                        onChange={handleChange(setStock, 'stock')}
                        min="1"
                        step="1"
                        error={errors.stock}
                    />
                    
                    <div className='mt-6'>
                        <Button 
                            type='submit' 
                            value={buttonValue}
                            disabled={loading || Object.keys(errors).length > 0} 
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}