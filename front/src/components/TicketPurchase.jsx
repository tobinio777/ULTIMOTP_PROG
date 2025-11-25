import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const TicketPurchase = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const ticketRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  
  const purchaseData = location.state?.purchaseData
  const { user } = useStore()

  useEffect(() => {
    if (!purchaseData) {
      navigate('/private')
    }
  }, [purchaseData, navigate])

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const element = ticketRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Ticket_Compra_${Date.now()}.pdf`)

      setTimeout(() => {
        navigate('/private')
      }, 500)
    } catch (error) {
      alert('Error al generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  if (!purchaseData) return null

  const currentDate = new Date().toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div ref={ticketRef} className="bg-white shadow-2xl rounded-lg p-8 mb-6">
          <div className="border-b-4 border-green-600 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-center text-green-600">
              ✓ COMPRA EXITOSA
            </h1>
            <p className="text-center text-gray-600 mt-2">Ticket de Compra</p>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Cliente:</p>
                <p className="font-semibold">{user.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha:</p>
                <p className="font-semibold">{currentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Método de Pago:</p>
                <p className="font-semibold">{purchaseData.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-4 mb-4">
            <h3 className="font-bold text-lg mb-3">Detalle de Productos:</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cant.</th>
                  <th className="text-right py-2">Precio Unit.</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.qty}</td>
                    <td className="text-right py-2">${Number(item.price).toFixed(2)}</td>
                    <td className="text-right py-2">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                TOTAL: ${purchaseData.total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>¡Gracias por su compra!</p>
            <p className="mt-1">Inventario APP - Sistema de Gestión</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Generando PDF...' : '📥 Descargar Ticket PDF'}
          </button>
          
          <button
            onClick={() => navigate('/private')}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketPurchase