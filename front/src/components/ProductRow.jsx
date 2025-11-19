import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

export const ProductRow = ({ data, onDelete }) => {
  const { user, addToCart, cart } = useStore()
  const location = useLocation()

  const isPrivate = location.pathname.includes('/private')
  const isOwner = user?.id === data.userId
  const isAdmin = user?.role === 'admin'
  const creatorName = data.creator?.fullName || 'N/A'

  const cartItem = cart.find(c => c.id === data.id)

  const handleAdd = () => {
    // prevenir agregar si stock insuficiente
    if (data.stock <= 0) {
      alert('No hay stock disponible')
      return
    }
    addToCart(data)
  }

  const actionButtons = (() => {
    // Si estamos en la vista privada (gestión) y es owner/admin -> mostrar editar/borrar
    if (isPrivate && (isOwner || isAdmin)) {
      return (
        <section className='flex gap-2 min-w-[170px] justify-end'>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md"
            onClick={() => onDelete(data.id)}
          >
            Borrar
          </button>

          <Link
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-md"
            to={`/private/product/edit/${data.id}`}
          >
            Editar
          </Link>
        </section>
      )
    }

    // Si no estamos en privado (pública) o es cliente -> mostrar agregar al carrito
    return (
      <div className="relative">
        <button
          onClick={handleAdd}
          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow"
        >
          Agregar
        </button>

        {cartItem && (
          <span className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {cartItem.qty}
          </span>
        )}
      </div>
    )
  })()

  return (
    <div className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-3">
      <div className='flex grow items-center justify-between gap-8 max-w-[calc(100%-160px)]'>
        <div className='flex flex-col min-w-[150px] flex-1'>
          <p className="font-bold text-indigo-700 text-lg truncate">{data.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Creador: <span className='font-semibold text-pink-500'>{creatorName}</span>
          </p>
        </div>

        <div className='flex justify-end items-center gap-8 min-w-[200px]'>
          <p className="text-right text-green-600 font-bold min-w-[90px]">${data.price}</p>
          <p className="text-right font-semibold text-gray-800 min-w-20">Stock: {data.stock}</p>
        </div>
      </div>

      <div className='flex justify-end self-center ml-6'>
        {actionButtons}
      </div>
    </div>
  )
}
