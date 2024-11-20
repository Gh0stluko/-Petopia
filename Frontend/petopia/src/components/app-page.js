'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Search, UserCircle, Plus, Minus, Trash2 } from 'lucide-react'

const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
)

const ProductSkeleton = () => (
  <Card className="overflow-hidden">
    <SkeletonLoader className="h-48 w-full" />
    <CardContent className="p-4">
      <SkeletonLoader className="h-6 w-3/4 mb-2" />
      <SkeletonLoader className="h-4 w-1/4 mb-2" />
      <SkeletonLoader className="h-4 w-1/2 mb-4" />
      <SkeletonLoader className="h-10 w-full" />
    </CardContent>
  </Card>
)

export function PageJs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const cartRef = useRef(null)

  const categories = [
    { name: 'Food', image: '/placeholder.svg?height=200&width=200' },
    { name: 'Toys', image: '/placeholder.svg?height=200&width=200' },
    { name: 'Beds', image: '/placeholder.svg?height=200&width=200' },
    { name: 'Grooming', image: '/placeholder.svg?height=200&width=200' },
  ]

  const products = [
    { id: 1, name: 'Premium Dog Food', price: 29.99, image: '/placeholder.svg?height=200&width=200', rating: 4.5, reviews: 120 },
    { id: 2, name: 'Interactive Cat Toy', price: 14.99, image: '/placeholder.svg?height=200&width=200', rating: 4.2, reviews: 85 },
    { id: 3, name: 'Cozy Pet Bed', price: 39.99, image: '/placeholder.svg?height=200&width=200', rating: 4.8, reviews: 200 },
    { id: 4, name: 'Natural Shampoo', price: 9.99, image: '/placeholder.svg?height=200&width=200', rating: 4.0, reviews: 50 },
  ]

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id, delta) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item).filter(item => item.quantity > 0))
  }

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    };
  }, [])

  useEffect(() => {
    // Симуляція завантаження даних
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer);
  }, [])

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    (<AnimatePresence>
      <motion.div
        className="min-h-screen bg-white"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.5 }}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="w-10 h-10 bg-gray-200">
              {/* Placeholder for your logo */}
            </div>
            <nav className="flex items-center space-x-4">
              <div className="relative" ref={cartRef}>
                <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(!isCartOpen)}>
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span
                      className="absolute top-0 right-0 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
                {isCartOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-50">
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-4">Your Cart</h2>
                      {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                      ) : (
                        <>
                          <div className="max-h-96 overflow-y-auto">
                            {cart.map((item) => (
                              <div key={item.id} className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center">
                                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFromCart(item.id)}
                                    className="ml-2">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="font-bold">Total: ${totalPrice.toFixed(2)}</p>
                          </div>
                          <div className="mt-4 flex justify-between">
                            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                            <Button>Checkout</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User menu</span>
                </Button>
                {isMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exit</a>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <motion.section
          className="relative h-[60vh] bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          {isLoading ? (
            <SkeletonLoader className="h-full w-full" />
          ) : (
            <>
              <Image
                src="/placeholder.svg?height=1080&width=1920"
                alt="Happy pets"
                layout="fill"
                objectFit="cover"
                priority />
              <div
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="w-full max-w-md px-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search for pet supplies..."
                      className="w-full pl-10 pr-4 py-2 rounded-full border-none" />
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.section>

        {/* All Categories */}
        <motion.section
          className="py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">All Categories</h2>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {isLoading ? (
                Array(6).fill().map((_, index) => (
                  <SkeletonLoader key={index} className="h-10 w-full" />
                ))
              ) : (
                ['Food', 'Toys', 'Beds', 'Grooming', 'Health', 'Accessories'].map((category, index) => (
                  <Button key={index} variant="outline" className="w-full">
                    {category}
                  </Button>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* Featured Categories */}
        <motion.section
          className="py-12 bg-gray-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">Featured Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array(4).fill().map((_, index) => (
                  <SkeletonLoader key={index} className="h-40 w-full" />
                ))
              ) : (
                categories.map((category, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div
                      className="relative h-40 bg-gray-200 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      <Image src={category.image} alt={category.name} layout="fill" objectFit="cover" />
                      <div
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white font-semibold text-lg">{category.name}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* Featured Products */}
        <motion.section
          className="py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}>
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6 text-center">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                Array(4).fill().map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              ) : (
                products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    <div className="relative h-48">
                      <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-primary font-bold mb-2">${product.price.toFixed(2)}</p>
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm ml-2">({product.reviews} reviews)</span>
                      </div>
                      <Button className="w-full" onClick={() => addToCart(product)}>Add to Cart</Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; 2023 PetSupplies. All rights reserved.</p>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>)
  );
}