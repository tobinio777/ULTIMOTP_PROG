import { useStore } from '../store/useStore'
import { Link, useNavigate } from 'react-router-dom'

const CartPage = () => {
  const { cart, removeFromCart, cartTotal, user } = useStore()
  const navigate = useNavigate()
  const total = cartTotal()

  const handleBuy = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }
    
    if (!user?.token) {
      navigate('/login?fromCart=true')
      return
    }
    
    navigate('/checkout')
  }

  return (
    <div
    className='min-h-screen bg-cover bg-center relative'
      style={{ backgroundImage: "url('/deposito.jpg')" }} 
    >
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>

        {cart.length === 0 ? (
          <p className="text-gray-600">El carrito está vacío.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.id} className="p-4 bg-gray-50 rounded-lg border shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-gray-600">Precio: ${Number(item.price).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Stock disponible: {item.stock}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-green-600 font-bold">${(item.price * item.qty).toFixed(2)}</p>
                      <p className="text-sm">Cantidad: {item.qty}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleBuy}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Comprar
                </button>

                <Link to="/" className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg">
                  Seguir comprando
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  )
}

export default CartPage

