import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Public from "./components/Public"
import Private from './components/Private'
import Login from './components/Login'
import Register from './components/Register'
import { ProductList } from './components/ProductList'
import {ProductForm} from './components/ProductForm'
import { ToastContainer } from "react-toastify"
import Navbar from './components/Navbar'
import CartPage from './components/CartPage'
import Checkout from './components/Checkout'

const App = () => {
  return (
    <BrowserRouter>
      {/* Fondo global para toda la aplicación */}
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/deposito.jpg')" }}
      >
        {/* Overlay oscuro */}
        <div className="min-h-screen bg-black bg-opacity-40">
          <Navbar />
          
          <Routes>
            {/* Public routes */}
            <Route element={<Public />} path="/">
              <Route index element={<ProductList />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Private routes */}
            <Route element={<Private />} path="/private">
              <Route index element={<ProductList />} />
              <Route path="product/new" element={<ProductForm />} />
              <Route path="product/edit/:id" element={<ProductForm />} />
            </Route>

            {/* Cart & Checkout */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route path="*" element={<h1 className="text-white text-center text-3xl mt-20">404 - Página no encontrada</h1>} />
          </Routes>

          <ToastContainer theme="colored" />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App