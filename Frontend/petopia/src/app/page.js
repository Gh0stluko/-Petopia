'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Search, UserCircle, Plus, Minus, Trash2, Heart } from 'lucide-react'
import api from './services/api'
import Snowfall from 'react-snowfall'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Header from "@/components/nav"
import Footer from '@/components/Footer'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { NewProducts } from '@/components/items'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import BackgroundDecoration from "@/components/BackgroundDecoration"
const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const cartRef = useRef(null)
  const [animalCategories, setAnimalCategories] = useState([])
  const [itemCategories, setItemCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [User, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const [isHeartClicked, setIsHeartClicked] = useState({})
  const [wishlist, setWishlist] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  
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
    const fetchWishlist = async () => {
      try {
        if (!User) {
          return;
        }
        const wishresponse = await api.get('/user/me/');
        const wishlistData = wishresponse.data.wishlist;
  
        setWishlist(wishlistData);
  
        const heartState = {};
        wishlistData.forEach(productId => {
          heartState[productId] = true;
        });
  
        setIsHeartClicked(heartState);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
  
    fetchWishlist();
  }, [User]);

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

  const handlewishlist = async (id) => {
    if (!User) {
      setModalOpen(true);
    }
    else {
      try {
        setWishlist(prevWishlist => {
          const isInWishlist = prevWishlist[id];
          if (isInWishlist) {
            const { [id]: _, ...rest } = prevWishlist;
            return rest;
          }
          return {
            ...prevWishlist,
            [id]: true
          };
        });
    
        setIsHeartClicked(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
    
        const response = await api.put('/user/update_wishlist/', { 
          product_id: id 
        });
        
        console.log('Wishlist updated on server', response.data);
      } catch (error) {
        setWishlist(prevWishlist => {
          const isInWishlist = prevWishlist[id];
          if (!isInWishlist) {
            const { [id]: _, ...rest } = prevWishlist;
            return rest;
          }
          return {
            ...prevWishlist,
            [id]: true
          };
        });
        
        setIsHeartClicked(prev => ({
          ...prev,
          [id]: !prev[id]
        }));
    
        console.error('Error updating wishlist:', error);
      }
    }
  };

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
    <div className="min-h-screen">
        <BackgroundDecoration />
        <Snowfall color="white" snowflakeCount={200} />
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
                        {index === 0 ? 'Special Offers' : 'Exclusive Deals'}
                      </h1>
                      <p className="text-lg mb-6">
                        {index === 0 ? 'Discover amazing deals on pet supplies' : 'Save big on pet essentials'}
                      </p>
                      <Button size="lg">
                        {index === 0 ? 'Shop Now' : 'Explore Now'}
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

      {/* New Products */}
      <NewProducts products={products} handlewishlist={handlewishlist} isHeartClicked={isHeartClicked} title = "New products" isLoading={isLoading} />

      {/* Dogs products */}
      <NewProducts 
      products={products.filter(product =>
        product.Animal_Category.some(category => category.name.toLowerCase() === 'dogs')
      )}
      handlewishlist={handlewishlist} 
      isHeartClicked={isHeartClicked}
      title={"Dog's products"}
      isLoading={isLoading}
    />

      {/* Cat products */}
      <NewProducts 
      products={products.filter(product =>
        product.Animal_Category.some(category => category.name.toLowerCase() === 'cats')
      )}
      handlewishlist={handlewishlist} 
      isHeartClicked={isHeartClicked}
      title={"Cat's products"}
      isLoading={isLoading}
    />
      {/* All Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-center">All Categories</h2>
          {isLoading ? (
    <Carousel
    opts={{
      align: "start",
    }}
    className="w-full max-w-sm"
  >
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

    <Footer />
    {/* Modal */}
    {modalOpen && (
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to be logged in to add items to your wishlist. Would you like to log in now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex justify-center items-center'>
          <AlertDialogCancel  onClick={() => setModalOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => router.push('/account/auth/')}>Log In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    )}

  </div>
  )
}

