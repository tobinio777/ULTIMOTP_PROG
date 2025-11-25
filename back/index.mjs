import express from "express"
import "dotenv/config"
import cors from "cors"
import path from "path"
import { fileURLToPath } from 'url'
import { sequelize } from './config/db.mjs'
import './config/db.mjs' 
import './models/User.mjs' 
import './models/Product.mjs' 
import { routes } from "./routes/user.mjs" 
import { productRoutes } from "./routes/product.mjs"
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 3001 
const app = express()

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors())
app.use(express.json())

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(routes) 
app.use("/products", productRoutes) 

app.listen(PORT, async () => {
    try {
        await sequelize.sync({ alter: true })
        console.log("Bases de datos conectada y modelos sincronizados")
        console.log(`servidor corriendo en http://localhost:${PORT}`)
    } catch (error) {
        console.log("Hubo un error en la conexion a la base de datos:", error.message)
    }
})