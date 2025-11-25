import { Router } from "express"
import { User } from '../models/User.mjs'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

export const routes = Router()

const validateEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const verifyEmailExists = async (email) => {
  const apiKey =  process.env.EMAIL_API_KEY

  if (!apiKey) {
    return { valid: true, message: "Verificación omitida (config)" }
  }

  try {
    const response = await fetch(`https://api.emailvalidation.io/v1/info?apikey=${apiKey}&email=${email}`)
    const data = await response.json()
    
    if (!response.ok) {
      return { valid: true, message: "Verificación de email no disponible" }
    }
    
    if (!data.format_valid) {
        return { valid: false, message: "El formato del email no es válido." }
    }

    if (data.disposable) {
        return { valid: false, message: "No se permiten correos temporales." }
    }

    if (!data.mx_found) {
        return { valid: false, message: "El dominio del correo no es válido (No recibe emails)." }
    }

    if (data.smtp_check === false || data.state === 'undeliverable') {
        return { valid: false, message: "La dirección de correo no existe." }
    }
    
    return {
      valid: true,
      message: "Email válido"
    }

  } catch (error) {
    return { valid: true, message: "Error en verificación, permitiendo registro" }
  }
}

routes.post("/", async (req, res) => {
  const body = req.body
  try {
    const { fullName, email, password, confirmPassword, role } = body
    
    if (password !== confirmPassword) {
      res.status(403).json({
        error: true,
        msg: "Las contraseñas no coinciden"
      })
      return
    }

    if (!validateEmailFormat(email)) {
      res.status(400).json({
        error: true,
        msg: "El formato del email no es válido"
      })
      return
    }

    const emailVerification = await verifyEmailExists(email)
    if (!emailVerification.valid) {
      res.status(400).json({
        error: true,
        msg: "El email proporcionado no existe o no es válido. Por favor verifica tu dirección de correo."
      })
      return
    }
    

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