import { useEffect, useState } from 'react'
import { Container } from './Container'
import { toast } from 'react-toastify'
import { useStore } from '../store/useStore'
import { Link, useLocation } from 'react-router-dom'
import { HistoryPanel } from './iu/HistoryPanel'
import { LoadingSpinner } from './iu/LoadingSpinner'
import { EmptyProductsMessage } from './iu/EmptyProductsMessage'
import { ProductCard } from './ProductCard'

export const ProductList = () => {
  const { user, setProducts } = useStore()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  // Función para cargar productos
  const loadProducts = async () => {
    setLoading(true)
    const url = `${import.meta.env.VITE_API_URL}/products`

    const headers = {
      'content-type': 'application/json',
      accept: 'application/json'
    }
    if (user && user.token) headers.Authorization = user.token

    try {
      const req = await fetch(url, { headers })
      const res = await req.json()

      if (!req.ok || res.error) {
        const errorMessage = res.msg || `Error al cargar (Status: ${req.status}).`
        toast.error(errorMessage)
        return
      }

      setData(res.data)
      setProducts(res.data)
    } catch (err) {
      toast.error("Error al cargar productos. Verifique que el backend esté encendido.")
    } finally {
      setLoading(false)
    }
  }

  // Cargar productos al montar y cuando cambia la ruta
  useEffect(() => {
    loadProducts()
  }, [user?.token, location.pathname])

  async function handleDelete(id) {
    if (!confirm("Desea eliminar el producto")) {
      toast.info("Producto no eliminado")
      return
    }
    try {
      const url = `${import.meta.env.VITE_API_URL}/products/?id=${id}`
      const deleteConfig = {
        method: 'DELETE',
        headers: {
          accept: "application/json",
          'Authorization': user.token
        }
      }
      const req = await fetch(url, deleteConfig)
      const res = await req.json()

      if (!req.ok || res.error) {
        const errorMessage = res.msg || `Error al intentar eliminar (Status: ${req.status})`
        toast.error(errorMessage)
        return
      }

      toast.info("Producto eliminado correctamente")
      setData(data.filter(p => p.id !== id))
    } catch (error) {
      console.error("Fallo de red o JSON al borrar:", error)
      toast.error("Ocurrió un error inesperado al borrar")
    }
  }

  const listContent = (() => {
    if (loading) return <LoadingSpinner />
    if (data.length === 0) return <EmptyProductsMessage />
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((product) => (
          <ProductCard key={product.id} data={product} onDelete={handleDelete} />
        ))}
      </div>
    )
  })()

  const ActionButton = () => {
    if (user?.role === 'admin') {
      return (
        <Link to="/private/product/new" className="inline-block py-2 px-4 rounded-lg shadow-md font-bold text-sm transition-all text-white bg-linear-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950">
          + Cargar Producto
        </Link>
      )
    }

    return (
      <Link to="/cart" className="inline-block py-2 px-4 rounded-lg shadow-md font-bold text-sm transition-all text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
        + Ir al Carrito
      </Link>
    )
  }

  return (
    <div className="flex container mx-auto gap-8 pt-5 max-w-7xl px-4">
      {user && user.token && user.role === 'admin' && (
        <div className="hidden lg:block w-1/4">
          <HistoryPanel data={data} />
        </div>
      )}

      <div className={user && user.token && user.role === 'admin' ? "w-full lg:w-3/4" : "w-full"}>
        <Container>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Productos en Stock ({data.length})
            </h1>
            <ActionButton />
          </div>

          {listContent}
        </Container>
      </div>
    </div>
  )
}