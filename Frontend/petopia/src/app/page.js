'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Minus } from 'lucide-react'
import api from './services/api'
import Snowfall from 'react-snowfall'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import Header from '@/components/nav'

const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);

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

export default function HomePage() {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [animalCategories, setAnimalCategories] = useState([])
  const [itemCategories, setItemCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [User, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const categoriesRef = useRef(null)
  const productsRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const categoriesY = useTransform(scrollYProgress, [0, 0.3], [100, 0])
  const productsY = useTransform(scrollYProgress, [0.3, 0.6], [100, 0])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [animalCategoriesRes, itemCategoriesRes, productsRes] = await Promise.all([
          api.get('/animal_categories/'),
          api.get('/item_categories/'),
          api.get('/products/')
        ]);

        setAnimalCategories(animalCategoriesRes.data);
        setItemCategories(itemCategoriesRes.data);
        setProducts(productsRes.data);
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
          const userRes = await api.get('/user/me/');
          setUser(userRes.data);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setCategories([...animalCategories, ...itemCategories])
  }, [animalCategories, itemCategories])

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
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

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=true&q=${searchQuery}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        totalItems={totalItems}
        User={User}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gray-100">
        {isLoading ? (
          <SkeletonLoader className="h-full w-full" />
        ) : (
          <>
            <Image
              alt="Petopia"
              src='/banner.jpg'
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority
            />
            <Snowfall />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-5xl font-bold mb-4">Welcome to Petopia</h1>
                <p className="text-xl mb-8">Your one-stop shop for all pet needs</p>
                <Button size="lg" onClick={() => document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' })}>
                  Shop Now
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* All Categories */}
      <motion.section 
        ref={categoriesRef}
        style={{ y: categoriesY }}
        className="py-12"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {isLoading ? (
              Array(6).fill().map((_, index) => (
                <SkeletonLoader key={index} className="h-24 w-full" />
              ))
            ) : (
              itemCategories.map((category, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="w-full h-24 text-lg font-semibold">
                    {category.name}
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill().map((_, index) => (
                <SkeletonLoader key={index} className="h-40 w-full" />
              ))
            ) : (
              categories.slice(0, 4).map((category, index) => (
                <motion.div 
                  key={index} 
                  className="group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white font-semibold text-lg">{category.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <motion.section 
        ref={productsRef}
        style={{ y: productsY }}
        className="py-12"
        id="featured-products"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array(4).fill().map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              products.slice(0,8).map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full transition-shadow duration-300 hover:shadow-lg">
                    <div className="relative h-48">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
                      <Link href={`/product/${product.id}`} className="font-semibold text-lg mb-2 hover:underline">
                        {product.name}
                      </Link>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-xl">
                            {!isNaN(parseFloat(product.price)) ? parseFloat(product.price).toFixed(2) : '0.00'} грн
                          </span>
                        </div>
                        {cart.find(item => item.id === product.id) ? (
                          <div className="flex items-center justify-between">
                            <Button variant="outline" size="icon" onClick={() => updateQuantity(product.id, -1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span>{cart.find(item => item.id === product.id).quantity}</span>
                            <Button variant="outline" size="icon" onClick={() => updateQuantity(product.id, 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button className="w-full" onClick={() => addToCart(product)}>Add to Cart</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image src="/logo.svg" alt="Petopia" width={40} height={40} />
              <span className="ml-2 text-xl font-bold text-gray-800">Petopia</span>
            </div>
            <nav className="flex flex-wrap justify-center md:justify-end gap-4">
              <Link href="#" className="text-gray-600 hover:text-gray-800">About Us</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-800">Contact</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-800">Terms of Service</Link>
              <Link href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link>
            </nav>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Petopia. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

