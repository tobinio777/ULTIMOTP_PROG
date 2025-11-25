import { Outlet, useNavigate } from 'react-router-dom' 
import { useStore } from '../store/useStore'
import { useEffect } from 'react'

function Private() {
  const { user } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user.token) {
      navigate("/")
    }
  }, [user.token, navigate])

  return (
    <div
    className='min-h-screen bg-cover bg-center relative'
      style={{ backgroundImage: "url('/deposito.jpg')" }} 
    >
      
    <main className='p-4'>
      <Outlet />
    </main>
    </div>
  )
}

export default Private