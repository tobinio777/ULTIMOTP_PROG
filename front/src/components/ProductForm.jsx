import { Button } from './Button'
import { useState, useEffect } from 'react'
import { toast } from "react-toastify"
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { FormHeader } from './iu/FormHeader'
import { FormInputWithError } from './iu/FormInputWithError'

export const ProductForm = () => {
    const { user } = useStore()
    const navigate = useNavigate()
    const params = useParams()
    
    const isEditing = Boolean(params.id)
    const [id, setId] = useState(params.id || "")
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [stock, setStock] = useState("")
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    const authHeaders = {
        "accept": "application/json",
        'Authorization': user.token 
    }

    useEffect(() => {
        const getProduct = async () => {
            if (!isEditing) return
            
            try {
                const url = `${import.meta.env.VITE_API_URL}/products/product?id=${params.id}` 
                const config = { method: "GET", headers: authHeaders }
                const req = await fetch(url, config)
                const res = await req.json()
                
                if (res.error) {
                    toast.error(res.msg)
                    return
                }
                
                setName(res.product.name)
                setPrice(String(res.product.price))
                setStock(String(res.product.stock))
                
                if (res.product.imageUrl) {
                    setImagePreview(`${import.meta.env.VITE_API_URL}/uploads/${res.product.imageUrl}`)
                }
            } catch (err) {
                toast.error(`Error al cargar producto: ${err.message}`)
            }
        }
        
        if (user.token && isEditing) {
            getProduct()
        }
    }, [user.token, isEditing, params.id])

    const validateForm = () => {
        const newErrors = {}
        const parsedPrice = parseFloat(price)
        const parsedStock = parseInt(stock)

        if (!name.trim()) {
            newErrors.name = "El nombre del producto es obligatorio."
        }
        
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            newErrors.price = "El precio debe ser un número no negativo."
        } else if (parsedPrice > 1000000) {
            newErrors.price = "El precio es excesivamente alto."
        }

        if (isNaN(parsedStock) || parsedStock < 1) {
            newErrors.stock = "La cantidad mínima debe ser 1."
        } else if (parsedStock !== Math.floor(parsedStock)) {
            newErrors.stock = "La cantidad debe ser un número entero."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        handleFile(file)
    }

    const handleFile = (file) => {
        if (!file) return

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB')
            return
        }

        setImageFile(file)
        
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const updateProduct = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('price', parseFloat(price))
            formData.append('stock', parseInt(stock))
            
            if (imageFile) {
                formData.append('image', imageFile)
            }

            const config = {
                method: "PUT",
                headers: { 'Authorization': user.token },
                body: formData
            }
            
            const url = `${import.meta.env.VITE_API_URL}/products/?id=${id}`
            const req = await fetch(url, config)
            const res = await req.json()
            
            if (res.error) {
                toast.error(res.msg)
                return
            }
            
            toast.success(res.msg)
            setTimeout(() => navigate("/private"), 700)
        } catch (er) {
            toast.error("Ha ocurrido un error al actualizar")
        } finally {
            setLoading(false)
        }
    }

    const createProduct = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('price', parseFloat(price))
            formData.append('stock', parseInt(stock))
            
            if (imageFile) {
                formData.append('image', imageFile)
            }

            const config = {
                method: "POST",
                headers: { 'Authorization': user.token },
                body: formData
            }
            
            const url = `${import.meta.env.VITE_API_URL}/products`
            const req = await fetch(url, config)
            const res = await req.json()
            
            if (res.error) {
                toast.error(res.msg)
                return
            }
            
            toast.success(res.msg)
            setName("")
            setPrice("")
            setStock("")
            setImageFile(null)
            setImagePreview(null)
        } catch (er) {
            toast.error("Ha ocurrido un error al crear")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error("Por favor, corrige los errores del formulario.")
            return
        }

        if (isEditing) {
            await updateProduct()
        } else {
            await createProduct()
        }
    }
    
    const handleChange = (setter, key) => (e) => {
        setter(e.target.value)
        if (errors[key]) {
            setTimeout(validateForm, 0)
        }
    }

    return (
        <div className='min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center py-12 px-4'>
            <div className='relative z-10 w-full flex flex-col items-center'>
                <FormHeader title={isEditing ? "Editar Producto" : "Cargar Producto"} />

                <form 
                    className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100" 
                    onSubmit={handleSubmit}
                >
                    <FormInputWithError
                        type="text"
                        name="Nombre_Producto"
                        placeholder="Ingrese el producto"
                        value={name}
                        title="Nombre del Producto"
                        onChange={handleChange(setName, 'name')}
                        error={errors.name}
                    />

                    <FormInputWithError
                        type="number"
                        name="Precio"
                        placeholder="Ingrese el precio (Mínimo 0)"
                        value={price}
                        title="Precio"
                        onChange={handleChange(setPrice, 'price')}
                        step="0.01"
                        error={errors.price}
                    />

                    <FormInputWithError
                        name="Cantidad"
                        type="number"
                        placeholder="Ingrese la cantidad (Mínimo 1, entero)"
                        value={stock}
                        title="Stock"
                        onChange={handleChange(setStock, 'stock')}
                        min="1"
                        step="1"
                        error={errors.stock}
                    />

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold text-sm text-gray-700">
                            Imagen del Producto
                        </label>
                        
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('imageInput').click()}
                        >
                            <input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="max-h-48 mx-auto rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setImageFile(null)
                                            setImagePreview(null)
                                        }}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-4xl">📷</div>
                                    <p className="text-gray-600">
                                        Arrastra una imagen aquí o haz clic para seleccionar
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        JPG, PNG, GIF, WEBP (máx. 5MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className='mt-6'>
                        <Button 
                            type='submit' 
                            value={loading ? "Cargando..." : (isEditing ? "Actualizar" : "Cargar")}
                            disabled={loading || Object.keys(errors).length > 0} 
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}