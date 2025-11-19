import { Router } from "express"
import { User } from '../models/User.mjs'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

export const routes = Router()

// Función para validar formato de email
const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para verificar si el email existe (usando API gratuita)
const verifyEmailExists = async (email) => {
  try {
    // Usamos la API gratuita de EmailValidation
    const response = await fetch(`https://api.emailvalidation.io/v1/info?apikey=ema_live_YOUR_API_KEY&email=${email}`)
    const data = await response.json()
    
    // Si la API no está configurada o falla, permitir el registro
    if (!response.ok) {
      console.log("API de verificación no disponible, permitiendo registro")
      return { valid: true, message: "Verificación de email no disponible" }
    }
    
    // Verificar si el email es válido según la API
    return {
      valid: data.format_valid && data.smtp_check !== false,
      message: data.format_valid ? "Email válido" : "Formato de email inválido"
    }
  } catch (error) {
    console.error("Error verificando email:", error)
    // Si hay error en la verificación, permitir el registro
    return { valid: true, message: "Error en verificación, permitiendo registro" }
  }
}

routes.post("/", async (req, res) => {
  const body = req.body
  try {
    const { fullName, email, password, confirmPassword, role } = body
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      res.status(403).json({
        error: true,
        msg: "Las contraseñas no coinciden"
      })
      return
    }

    // Validar formato de email
    if (!validateEmailFormat(email)) {
      res.status(400).json({
        error: true,
        msg: "El formato del email no es válido"
      })
      return
    }

    // Verificar si el email existe (comentado por ahora, descomentar cuando tengas API key)
    /*
    const emailVerification = await verifyEmailExists(email)
    if (!emailVerification.valid) {
      res.status(400).json({
        error: true,
        msg: "El email proporcionado no existe o no es válido. Por favor verifica tu dirección de correo."
      })
      return
    }
    */

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    
    const user = new User({
      fullName,
      email,
      hash,
      activateToken: "123",
      role: role || 'cliente'
    })

    await user.save()
    res.json({
      error: false,
      msg: "Usuario creado correctamente"
    })

  } catch (err) {
    // Manejar error de email duplicado
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        error: true,
        msg: "Este email ya está registrado. Por favor usa otro email."
      })
      return
    }
    
    res.status(400).json({
      error: true,
      msg: err.message
    })
  }
})

routes.post("/login", async (req, res) => {
  try {
    const body = req.body
    const { email, password } = body

    const user = await User.findOne({
      where: {
        email: email
      }
    })

    if (!user) {
      res.status(404).json({
        error: true,
        msg: "El usuario no existe"
      })
      return
    }

    const checkPasswd = await bcrypt.compare(password, user.hash)

    if (!checkPasswd) {
      res.status(403).json({
        error: true,
        msg: "Password incorrecto"
      })
      return
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    const token = jwt.sign(payload, process.env.SECRET)

    res.json({
      error: false,
      user: {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        role: user.role,
        token: `Bearer ${token}`
      }
    })
  } catch(e) {
    console.log(e)
    res.status(500).json({
      error: true,
      msg: "Hubo un error al iniciar sesion"
    })
  }
})

routes.get("/verify-token", async (req, res) => {
  const headers = req.headers
  const auth = headers.authorization

  if (!auth) {
    return res.status(401).json({ error: true, msg: "No se proporciono un token" })
  }

  const token = auth.split(" ")[1]

  try {
    const verify = jwt.verify(token, process.env.SECRET)

    if (!verify) {
      return res.json({ error: true })
    }

    res.json({
      error: false,
      id: verify.id,
      email: verify.email,
      role: verify.role
    })
  } catch (err) {
    res.status(401).json({ error: true, msg: "Token inválido o expirado" })
  }
})