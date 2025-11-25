import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

export const ProductCard = ({ data, onDelete }) => {
  const { user, addToCart, cart } = useStore()
  const location = useLocation()

  const isPrivate = location.pathname.includes('/private')
  const isOwner = user?.id === data.userId
  const isAdmin = user?.role === 'admin'
  const creatorName = data.creator?.fullName || 'N/A'

  const cartItem = cart.find(c => c.id === data.id)

  const handleAdd = () => {
    if (data.stock <= 0) {
      alert('No hay stock disponible')
      return
    }
    addToCart(data)
  }

  const imageUrl = data.imageUrl 
    ? `${import.meta.env.VITE_API_URL}/uploads/${data.imageUrl}` 
    : 'https://via.placeholder.com/300x200?text=Sin+Imagen'

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={imageUrl} 
          alt={data.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen'
          }}
        />
        {cartItem && (
          <div className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {cartItem.qty}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-xl text-indigo-700 mb-2 truncate">
          {data.name}
        </h3>
        
        <p className="text-xs text-gray-500 mb-3">
          Creador: <span className="font-semibold text-pink-500">{creatorName}</span>
        </p>

        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold text-green-600">${data.price}</p>
            <p className="text-sm text-gray-600">Stock: {data.stock}</p>
          </div>
        </div>

        {isPrivate && (isOwner || isAdmin) ? (
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(data.id)}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Borrar
            </button>
            <Link
              to={`/private/product/edit/${data.id}`}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-md text-center transition-all"
            >
              Editar
            </Link>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  )
}