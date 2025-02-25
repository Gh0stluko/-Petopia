'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const callbackRef = useRef(null)
  
  // Використовуємо useEffect для виклику колбеків, щоб уникнути оновлення стану під час рендерингу
  useEffect(() => {
    if (callbackRef.current) {
      const { callback, args } = callbackRef.current
      callback(...args)
      callbackRef.current = null
    }
  }, [cart])

  useEffect(() => {
    // Завантаження кошика з localStorage при монтуванні компонента
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    // Збереження кошика в localStorage при кожній зміні
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product, onSuccess) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        // Зберігаємо колбек для виклику після оновлення стану
        if (onSuccess) {
          callbackRef.current = {
            callback: onSuccess,
            args: [product, true]
          }
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      // Зберігаємо колбек для виклику після оновлення стану
      if (onSuccess) {
        callbackRef.current = {
          callback: onSuccess,
          args: [product, false]
        }
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  // Функція для додавання продукту з вказаною кількістю
  const addToCartWithQuantity = (product, quantity = 1, onSuccess) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        if (onSuccess) {
          callbackRef.current = {
            callback: onSuccess,
            args: [product, true, quantity]
          }
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      
      if (onSuccess) {
        callbackRef.current = {
          callback: onSuccess,
          args: [product, false, quantity]
        }
      }
      return [...prevCart, { ...product, quantity }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = (id, onSuccess) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.id === id)
      if (item && onSuccess) {
        callbackRef.current = {
          callback: onSuccess,
          args: [item]
        }
      }
      return prevCart.filter(item => item.id !== id)
    })
  }

  const clearCart = (onSuccess) => {
    setCart([])
    if (onSuccess) {
      callbackRef.current = {
        callback: onSuccess,
        args: []
      }
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const toggleCart = () => {
    setIsCartOpen(prev => !prev)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const value = {
    cart,
    isCartOpen,
    addToCart,
    addToCartWithQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    toggleCart,
    closeCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 