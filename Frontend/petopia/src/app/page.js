'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Search, UserCircle, Plus, Minus, Trash2 } from 'lucide-react'
import api from './services/api'
import Snowfall from 'react-snowfall'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  const handlelogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('username');
    window.location.href = '/';
  }
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="w-16 h-16 rounded-full relative">
            <Image src="/logo.svg" alt="Petopia" fill priority style={{ objectFit: 'contain' }} />
          </div>
          <nav className="flex items-center space-x-4">
            <div className="relative" ref={cartRef}>
              <Button variant="ghost" size="icon" onClick={() => {
                setIsCartOpen(!isCartOpen)
                setIsMenuOpen(false)
              }}>
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
                              </div>
                              <div className="flex items-center">
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="ml-2">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
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
            {User && User.registration_complete ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen)
          }}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={User.avatar} alt="User Avatar" />
            <AvatarFallback>{User.first_name?.[0]}{User.last_name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      ) : User && !User.registration_complete ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push('account/auth/verification');
          }}
        >
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">Complete Profile</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push('/account/auth');
          }}
        >
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">Login</span>
        </Button>
      )}
              
              {isMenuOpen && User && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <a href={`/account/${User.username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </a>
                  <button
                    onClick={handlelogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gray-100">
        {isLoading ? (
          <SkeletonLoader className="h-full w-full" />
        ) : (
          <>
            <Image
              alt="Petopia"
              src='/banner.jpg'
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              priority
            />
            <Snowfall />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="w-full max-w-md px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" />
                  <Input
                    type="search"
                    placeholder="I want to discover..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border-none bg-white bg-opacity-80 backdrop-blur-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-opacity-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* All Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">All Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading ? (
              Array(6).fill().map((_, index) => (
                <SkeletonLoader key={index} className="h-10 w-full" />
              ))
            ) : (
              itemCategories.map((category, index) => (
                <Button key={index} variant="outline" className="w-full">
                  {category.name}
                </Button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              Array(4).fill().map((_, index) => (
                <SkeletonLoader key={index} className="h-40 w-full" />
              ))
            ) : (
              categories.slice(0, 4).map((category, index) => (
                <div key={index} className="group cursor-pointer">
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
                </div>
              ))
            )}
          </div>
        </div>
      </section>
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
    </div>
  )
}