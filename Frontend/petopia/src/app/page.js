'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Search, UserCircle, Plus, Minus, Trash2 } from 'lucide-react'
import api from './services/api'
import Snowfall from 'react-snowfall'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import Header from "../components/nav"
import Footer from '@/components/Footer'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);


export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const cartRef = useRef(null)
  const [animalCategories, setAnimalCategories] = useState([])
  const [itemCategories, setItemCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [User, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
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
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])
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
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  return (
    <div className="min-h-screen bg-white">
      <Header
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={(id) => setCart(cart.filter(item => item.id !== id))}
        clearCart={() => setCart([])}
        totalItems={totalItems}
        User={User}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        Search_Included={true}
      />

{/* Hero Carousel */}
<section className="container mx-auto px-4 py-6">
  <Carousel className="w-full">
    <CarouselContent>
      {[1, 2].map((_, index) => (
        <CarouselItem key={index}>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={`/banners/banner-${index + 1}.jpg`}
              alt={`Promotional banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="text-white p-8 max-w-xl">
                <h1 className="text-4xl font-bold mb-4">
                  {index === 0 ? 'Special Offers' : index === 1 ? 'Exclusive Deals' : 'Limited Time Offers'}
                </h1>
                <p className="text-lg mb-6">
                  {index === 0 ? 'Discover amazing deals on pet supplies' : index === 1 ? 'Save big on pet essentials' : 'Hurry, offers end soon!'}
                </p>
                <Button size="lg">
                  {index === 0 ? 'Shop Now' : index === 1 ? 'Explore Now' : 'Grab Now'}
                </Button>
              </div>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</section>


      {/* All Categories */}
      <section className="py-12 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-2xl font-semibold mb-6 text-center">All Categories</h2>
    {isLoading ? (
      <Carousel>
        <CarouselContent>
          {Array(4).fill().map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
              <Card>
                <CardContent className="p-0">
                  <SkeletonLoader className="h-40 w-full" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    ) : (
      <Carousel>
        <CarouselContent>
          {categories.map((category, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/4">
              <Card className="group cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative h-40 bg-gray-200 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
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
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    )}
  </div>
</section>

{/* New Products */}



{/* Featured Products */}

      <section className="py-12">



      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill().map((_, index) => (
              <Card key={index} className="flex flex-col justify-between h-full">
                <div className="animate-pulse bg-gray-200 h-48 w-full"></div>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="animate-pulse bg-gray-200 h-6 w-3/4 mb-2"></div>
                  <div className="mt-auto">
                    <div className="animate-pulse bg-gray-200 h-4 w-1/4 mb-2"></div>
                    <div className="animate-pulse bg-gray-200 h-10 w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            products.slice(0,8).map((product) => (
              <Card key={product.id} className="flex flex-col justify-between h-full transition-shadow duration-300 hover:shadow-lg">
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
                <CardContent className="p-4 flex-grow flex flex-col">
                  <Link href={`/product/${product.id}`} className="font-semibold text-lg mb-2 hover:underline">
                    {product.name}
                  </Link>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">
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
            ))
          )}
        </div>
      </div>
    </section>
    <Footer />
    </div>
    
  )
}