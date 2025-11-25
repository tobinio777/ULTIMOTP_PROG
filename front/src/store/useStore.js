import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(persist(
  (set, get) => ({
    user: {
      id: null,
      email: null,
      full_name: null,
      token: null,
      role: 'cliente'
    },

    products: [],

    cart: [],

    setUser: (newuser) => set({ user: newuser }),

    logout: () => set({ user: { id: null, email: null, full_name: null, token: null, role: 'cliente' }, cart: [] }),

    setProducts: (products) => set({ products }),

    addToCart: (product) => {
      const cart = get().cart.slice()
      const found = cart.find(p => p.id === product.id)
      if (found) {
        if ((found.qty + 1) <= product.stock) {
          found.qty += 1
          set({ cart })
        }
      } else {
        set({ cart: [...cart, { ...product, qty: 1 }] })
      }
    },

    removeFromCart: (id) => {
      set({ cart: get().cart.filter(p => p.id !== id) })
    },

    updateQty: (id, qty) => {
      const cart = get().cart.slice()
      const found = cart.find(p => p.id === id)
      if (!found) return
      const newQty = Math.max(1, Math.min(qty, found.stock))
      found.qty = newQty
      set({ cart })
    },

    clearCart: () => set({ cart: [] }),

    cartCount: () => get().cart.reduce((s, p) => s + p.qty, 0),

    cartTotal: () => get().cart.reduce((s, p) => s + Number(p.price) * p.qty, 0),

    decrementStockOnServer: async () => {
      const user = get().user
      const cart = get().cart
      const baseUrl = import.meta.env.VITE_API_URL
      const results = { success: true, errors: [] }

      if (!user?.token) {
        results.success = false
        results.errors.push('No autorizado')
        return results
      }

      for (const item of cart) {
        try {
          const newStock = Number(item.stock) - Number(item.qty)
          if (newStock < 0) {
            results.success = false
            results.errors.push(`Stock insuficiente para ${item.name}`)
            continue
          }

          const url = `${baseUrl}/products/?id=${item.id}`
          const config = {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
              Authorization: user.token
            },
            body: JSON.stringify({
              name: item.name,
              price: Number(item.price),
              stock: newStock
            })
          }

          const req = await fetch(url, config)
          const res = await req.json()

          if (!req.ok || res.error) {
            results.success = false
            const msg = res.msg || `Error actualizando producto ${item.name}`
            results.errors.push(msg)
          }
        } catch (err) {
          results.success = false
          results.errors.push(`Fallo de red al actualizar ${item.name}`)
        }
      }

      return results
    }
  }),
  {
    name: 'token_login_web_v2'
  }
))