import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toast } from 'react-toastify'

const Checkout = () => {
  const { user, cart, cartTotal, clearCart } = useStore()
  const navigate = useNavigate()
  const total = cartTotal()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user?.token) {
      navigate('/login?fromCart=true')
      return
    }
    
    if (cart.length === 0) {
      toast.info('El carrito está vacío')
      navigate('/')
    }
  }, [user, cart, navigate])

  const handlePayment = async (method) => {
    if (processing) return
    
    setProcessing(true)
    
    try {
      const cartData = cart.map(item => ({
        id: item.id,
        qty: item.qty
      }))

      const url = `${import.meta.env.VITE_API_URL}/products/buy`
      const config = {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': user.token
        },
        body: JSON.stringify({ cart: cartData })
      }

      const req = await fetch(url, config)
      const res = await req.json()

      if (!req.ok || res.error) {
        toast.error(res.msg || 'Error al procesar la compra')
        setProcessing(false)
        return
      }

      toast.success(`✅ Simulación de compra realizada con ${method}`)
      toast.info(`Stock actualizado correctamente`)

      clearCart()
      
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (err) {
      console.error('Error en checkout:', err)
      toast.error('Error de conexión al procesar la compra')
      setProcessing(false)
    }
  }

  if (!user?.token || cart.length === 0) {
    return null
  }

  return (
    <div
    className='min-h-screen bg-cover bg-center relative'
      style={{ backgroundImage: "url('/deposito.jpg')" }} 
    >
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Medios de Pago</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Resumen de la compra:</h3>
          <ul className="space-y-1 mb-3">
            {cart.map(item => (
              <li key={item.id} className="text-sm text-gray-700">
                • {item.name} x{item.qty} = ${(item.price * item.qty).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="text-xl font-bold text-green-600 border-t pt-2">
            Total a pagar: ${total.toFixed(2)}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button 
            onClick={() => handlePayment('Mercado Pago')} 
            disabled={processing}
            className="w-full py-3 rounded-lg font-semibold bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : '💳 Pagar con Mercado Pago'}
          </button>

          <button 
            onClick={() => handlePayment('Ualá')} 
            disabled={processing}
            className="w-full py-3 rounded-lg font-semibold bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : '🔴 Pagar con Ualá'}
          </button>

          <button 
            onClick={() => handlePayment('MODO')} 
            disabled={processing}
            className="w-full py-3 rounded-lg font-semibold bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Procesando...' : '🟣 Pagar con MODO'}
          </button>
        </div>

        <button 
          onClick={() => navigate('/cart')} 
          disabled={processing}
          className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Volver al carrito
        </button>
      </div>
    </div>
    </div>
  )
}

export default Checkout