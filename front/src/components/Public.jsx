import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const Public = () => {
    const { user, setUser } = useStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user.token) {
            async function verifyUser() {
                const url = `${import.meta.env.VITE_API_URL}/verify-token` 
                const config = {
                    method: "GET",
                    headers: {
                        'content-type': "application/json",
                        'authorization': user.token
                    }
                }

                try {
                    const req = await fetch(url, config)
                    const res = await req.json()

                    if (res.error) {
                        setUser({ full_name: null, token: null, email: null, id: null })
                        return
                    }
                    
                    navigate("/private")
                } catch (e) {
                    setUser({ full_name: null, token: null, email: null, id: null })
                }
            }
            verifyUser()
        }
    }, [user.token, navigate, setUser])
    
    return (
        <div 
            className="mx-auto flex items-center justify-center min-h-screen bg-cover bg-center relative"
            style={{ backgroundImage: "url('/deposito.jpg')" }} 
        >
            <div className="absolute inset-0 bg-black opacity-40"></div> 
            
            <div className='relative z-10 p-4 w-full flex items-center justify-center'>
                <Outlet />
            </div>
        </div>
       
    )
}

export default Public