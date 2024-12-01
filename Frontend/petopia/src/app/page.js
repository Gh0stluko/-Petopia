'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Search, Plus, Minus, ChevronRight, Star } from 'lucide-react'
import Header from "@/components/nav"
import Footer from '@/components/Footer'
import api from './services/api'

const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [animalCategories, setAnimalCategories] = useState([])
  const [itemCategories, setItemCategories] = useState([])
  const [products, setProducts] = useState([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [cart, setCart] = useState([])
  const [User, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [animalCategoriesRes, itemCategoriesRes, productsRes] = await Promise.all([
          api.get('/animal_categories/'),
          api.get('/item_categories/'),
          api.get('/products/')
        ])

        setAnimalCategories(animalCategoriesRes.data)
        setItemCategories(itemCategoriesRes.data)
        // Sort products by rating
        const sortedProducts = productsRes.data.sort((a, b) => 
          (b.average_rating === "no review" ? 0 : b.average_rating) - 
          (a.average_rating === "no review" ? 0 : a.average_rating)
        )
        setProducts(sortedProducts)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=true&q=${searchQuery}`)
    }
  }

  const displayedCategories = showAllCategories 
    ? itemCategories 
    : itemCategories.slice(0, 8)

  return (
    <div className="min-h-screen bg-white">
      <Header
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={(id) => setCart(cart.filter(item => item.id !== id))}
        clearCart={() => setCart([])}
        totalItems={cart.reduce((sum, item) => sum + item.quantity, 0)}
        User={User}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        Search_Included={false}
      />

      {/* Hero Carousel */}
      <section className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="relative h-[500px] w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-transparent" />
                <Image
                  src="/banner.jpg"
                  alt="Special Offer"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-lg">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Black Friday Sale
                      </h1>
                      <p className="text-xl text-white mb-8">
                        Up to 50% off on selected items
                      </p>
                      <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                        Shop Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {/* Add more carousel items as needed */}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            {itemCategories.length > 8 && (
              <Button
                variant="ghost"
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="text-green-600 hover:text-green-700"
              >
                {showAllCategories ? 'Show Less' : 'Show All Categories'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              Array(8).fill().map((_, i) => (
                <SkeletonLoader key={i} className="h-32 w-full" />
              ))
            ) : (
              displayedCategories.map((category, index) => (
                <Link 
                  key={category.id} 
                  href={`/category/${category.id}`}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="relative h-32">
                    <Image
                      src={category.image || '/placeholder.svg'}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill().map((_, i) => (
                <Card key={i} className="flex flex-col">
                  <SkeletonLoader className="h-48 rounded-t-lg" />
                  <CardContent className="p-4">
                    <SkeletonLoader className="h-6 w-3/4 mb-2" />
                    <SkeletonLoader className="h-4 w-1/4 mb-4" />
                    <SkeletonLoader className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.slice(0, 8).map((product) => (
                <Card key={product.id} className="flex flex-col h-full group">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={product.images?.[0]?.image || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    {product.average_rating !== "no review" && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                          <span className="text-sm font-medium">{product.average_rating}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <Link href={`/product/${product.id}`} className="font-semibold text-lg mb-2 hover:text-green-600">
                      {product.name}
                    </Link>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold">
                          {parseFloat(product.price).toFixed(2)} грн
                        </span>
                      </div>
                      {cart.find(item => item.id === product.id) ? (
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">
                            {cart.find(item => item.id === product.id).quantity}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-[300px] rounded-lg overflow-hidden group">
              <Image
                src="/placeholder.svg"
                alt="New Arrivals"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8">
                <h3 className="text-3xl font-bold text-white mb-4">New Arrivals</h3>
                <p className="text-white mb-6">Discover our latest products</p>
                <Button className="w-fit bg-white text-green-600 hover:bg-gray-100">
                  Shop Now
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] rounded-lg overflow-hidden group">
              <Image
                src="/placeholder.svg"
                alt="Special Deals"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-center p-8">
                <h3 className="text-3xl font-bold text-white mb-4">Special Deals</h3>
                <p className="text-white mb-6">Limited time offers on selected items</p>
                <Button className="w-fit bg-white text-green-600 hover:bg-gray-100">
                  View Offers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

