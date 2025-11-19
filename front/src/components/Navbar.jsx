import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const Navbar = () => {
  const { user, cartCount, logout } = useStore()
  const navigate = useNavigate()
  const count = typeof cartCount === 'function' ? cartCount() : 0

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="py-4 shadow-md sticky top-0 z-10 border-b border-gray-700/50 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
        <Link to="/" className='font-extrabold text-xl text-white drop-shadow-md'>
          Inventario APP
        </Link>

        <div className="flex items-center gap-6">
          {/* Si user existe y no es admin -> mostrar Carrito */}
          {user?.role !== 'admin' && (
            <Link to="/cart" className="relative inline-block">
              <button className="py-2 px-4 text-sm font-bold rounded-lg shadow-md transition-all text-white bg-linear-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950">
                Carrito
              </button>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                  {count}
                </span>
              )}
            </Link>
          )}

          {/* Si no hay usuario -> link a login */}
          {!user?.token ? (
            <Link to="/login" className="py-2 px-4 text-sm font-bold rounded-lg shadow-md transition-all text-white bg-indigo-600 hover:bg-indigo-700">
              Iniciar Sesión
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white hidden sm:inline drop-shadow-md">
                Bienvenido, <strong className='text-white'>{user.full_name || user.fullName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="py-2 px-4 text-sm font-bold rounded-lg shadow-md transition-all text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar


