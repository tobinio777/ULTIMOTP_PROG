import { useState } from 'react'
import { Form } from './Form'
import { Input } from './Input'
import { Button } from "./Button"
import { Link } from 'react-router-dom' 
import { toast } from "react-toastify"

const Legend = () => {
    return (
        <p>
            Ya tiene cuenta? 
            <Link 
                to="/" 
                className='text-blue-600 hover:text-blue-700 font-semibold transition-colors underline'
            >
                Inicia Sesion
            </Link>
        </p>
    )
}

const Register = () => {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    // Validación básica de formato de email
    const validateEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validaciones en el frontend
        if (!fullName.trim()) {
            toast.error("El nombre completo es obligatorio")
            return
        }

        if (!email.trim()) {
            toast.error("El email es obligatorio")
            return
        }

        if (!validateEmailFormat(email)) {
            toast.error("Por favor ingresa un email válido (ejemplo: usuario@gmail.com)")
            return
        }

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden")
            return
        }

        setLoading(true)
        
        try {
            const url = `${import.meta.env.VITE_API_URL}/` 
            const body = { fullName, email, password, confirmPassword }

            const req = await fetch(url, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(body)
            })
            
            if (!req.ok) {
                const errorRes = await (async () => {
                    try {
                        return await req.json()
                    } catch (e) {
                        return { msg: `Error de servidor (${req.status}).` }
                    }
                })()
                toast.error(errorRes.msg)
                return
            }

            const res = await req.json()

            if (res.error) {
                toast.error(res.msg)
                return
            }

            toast.success("✅ " + res.msg)
            toast.info("Ahora puedes iniciar sesión")
            
            // Limpiar formulario
            setFullName("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")

        } catch (e){
            console.log(e)
            toast.error("Error de conexión con el servidor.")
        }
        finally {
            setLoading(false)
        }
    }

    const buttonValue = (() => {
        if (loading) {
            return "Verificando..."
        } else {
            return "Registrarse"
        }
    })()

    return (
        <Form title="Registrarse" Legend={Legend} onSubmit={handleSubmit}>
            <Input 
                name="fullName" 
                type="text" 
                id="fullname" 
                title="Nombre completo" 
                placeholder="Nombre y Apellido"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
            />
            <Input 
                name="email" 
                type="email" 
                title="Correo Electrónico" 
                placeholder="ejemplo@gmail.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
                type="password" 
                name="password" 
                title="Contraseña" 
                placeholder="Mínimo 6 caracteres"
                value={password} 
                id="password" 
                onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                title="Confirmar Contraseña" 
                placeholder="Repita la contraseña"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type='submit' value={buttonValue} disabled={loading} />
        </Form>
    )
}

export default Register