import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { toast } from 'react-toastify'
import jsPDF from 'jspdf'

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

  const generatePDF = (paymentMethod, purchaseData) => {
    const doc = new jsPDF()
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text("INVENTARIO APP", 105, 20, { align: "center" })
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("CUIT: 30-12345678-9", 105, 28, { align: "center" })
    doc.text("Dirección: Av. 1234, Ciudad, País", 105, 33, { align: "center" })
    doc.text("Tel: +54 123 456-7890", 105, 38, { align: "center" })
    
    doc.setLineWidth(0.5)
    doc.line(20, 42, 190, 42)
    
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("TICKET DE COMPRA", 105, 50, { align: "center" })
    
    const orderNumber = `#ORD-${Math.floor(Math.random() * 10000)}`
    const currentDate = new Date().toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    let yPos = 60
    
    doc.text(`Número de Orden: ${orderNumber}`, 20, yPos)
    yPos += 6
    doc.text(`Fecha y Hora: ${currentDate}`, 20, yPos)
    yPos += 6
    doc.text(`Tipo de Comprobante: Ticket`, 20, yPos)
    yPos += 10
    
    doc.setFont("helvetica", "bold")
    doc.text("DATOS DEL CLIENTE", 20, yPos)
    yPos += 6
    doc.setFont("helvetica", "normal")
    doc.text(`Nombre: ${user.full_name}`, 20, yPos)
    yPos += 6
    doc.text(`Email: ${user.email}`, 20, yPos)
    yPos += 6
    doc.text(`Condición Fiscal: Consumidor Final`, 20, yPos)
    yPos += 10
    
    doc.line(20, yPos, 190, yPos)
    yPos += 6
    
    doc.setFont("helvetica", "bold")
    doc.text("DETALLE DE LA COMPRA", 20, yPos)
    yPos += 8
    
    doc.setFontSize(9)
    doc.text("Cant.", 20, yPos)
    doc.text("Descripción", 40, yPos)
    doc.text("P. Unit.", 120, yPos)
    doc.text("Subtotal", 160, yPos)
    yPos += 4
    doc.line(20, yPos, 190, yPos)
    yPos += 6
    
    doc.setFont("helvetica", "normal")
    purchaseData.items.forEach(item => {
      doc.text(String(item.qty), 20, yPos)
      doc.text(item.name.substring(0, 40), 40, yPos)
      doc.text(`$${Number(item.price).toFixed(2)}`, 120, yPos)
      doc.text(`$${(item.qty * item.price).toFixed(2)}`, 160, yPos)
      yPos += 6
    })
    
    yPos += 2
    doc.line(20, yPos, 190, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const subtotal = purchaseData.total
    doc.text(`Subtotal:`, 130, yPos)
    doc.text(`$${subtotal.toFixed(2)}`, 160, yPos)
    yPos += 6
    
    doc.text(`Descuentos:`, 130, yPos)
    doc.text(`$0.00`, 160, yPos)
    yPos += 8
    
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text(`TOTAL  :`, 130, yPos)
    doc.text(`$${purchaseData.total.toFixed(2)}`, 160, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Medio de Pago: ${paymentMethod}`, 20, yPos)
    yPos += 6
    
    
    doc.line(20, yPos, 190, yPos)
    yPos += 8
    
    doc.setFontSize(9)
    doc.setFont("helvetica", "italic")
    doc.text("¡Gracias por su compra!", 105, yPos, { align: "center" })
    yPos += 5
    doc.text("Sistema de Gestión de Inventario - Inventario APP", 105, yPos, { align: "center" })
    
    doc.save(`Ticket_${orderNumber}_${Date.now()}.pdf`)
  }

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

      toast.success(`✅ Compra realizada con ${method}`)

      const purchaseData = {
        items: cart,
        total: total,
        paymentMethod: method,
        date: new Date().toISOString()
      }

      const downloadTicket = window.confirm(
        `Compra realizada exitosamente.\n\n¿Desea descargar el ticket de compra en PDF?`
      )

      if (downloadTicket) {
        generatePDF(method, purchaseData)
        toast.info("📥 Descargando ticket...")
      }

      clearCart()
      
      setTimeout(() => {
        navigate('/private')
      }, 1500)

    } catch (err) {
      toast.error('Error de conexión al procesar la compra')
      setProcessing(false)
    }
  }

  if (!user?.token || cart.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
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
  )
}

export default Checkout