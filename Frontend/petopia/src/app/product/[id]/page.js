'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ShoppingCart, Search, UserCircle, Star, MinusCircle, PlusCircle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/services/api';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from 'next/navigation';
import Header from '@/components/nav';
import Cookies from 'js-cookie';
import { set } from 'lodash';
const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isFilled, setIsFilled] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast()
  const [cart, setCart] = useState([])
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  const handleStarClick = async (rating) => {
    if (!user) {
      toast({
        title: 'You need to be logged in to submit a review.',
        status: 'error',
      });
      return;
    }
    setUserRating(rating);
    try {
      await api.post(`/products/1/rate/`, { rating });
      toast({
        title: 'Thank you for your review!',
        status: 'success',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Failed to submit review',
        status: 'error',
      });
    }
  };
  const handleLike = () => {
    setIsFilled(!isFilled);
    toast({
      title: isFilled ? 'Removed from favorites' : 'Added to favorites',
      status: isFilled ? 'error' : 'success',
    })
  }

  const changeImage = useCallback((newIndex, newDirection) => {
    if (!isAnimating && product.images.length > 1) {
      setIsAnimating(true);
      setDirection(newDirection);
      setSelectedImage(newIndex);
      setTimeout(() => setIsAnimating(false), 600); // Match this with your animation duration
    }
  }, [isAnimating, product]);

  const nextImage = useCallback(() => {
    const newIndex = (selectedImage + 1) % product.images.length;
    changeImage(newIndex, 1);
  }, [selectedImage, product, changeImage]);

  const prevImage = useCallback(() => {
    const newIndex = (selectedImage - 1 + product.images.length) % product.images.length;
    changeImage(newIndex, -1);
  }, [selectedImage, product, changeImage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await api.get(`/products/${params.id}`);
        setProduct(productResponse.data);
        const similarResponse = await api.get('/products/', {
          params: {
            category: productResponse.data.animal_category?.id,
            exclude: params.id,
            limit: 4
          }
        });
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
          const userRes = await api.get('/user/me/');
          setUser(userRes.data);
          const userreview = await api.get(`/user/get_reviews/`);
          setUserRating(userreview.data[0].rating);
        }
        setSimilarProducts(similarResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=true&q=${searchQuery}`)
    }
  }

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  
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

  if (isLoading || !product) {
    return (

      <div className="min-h-screen bg-gray-50">
      <Header/>
        <motion.header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <div className="w-12 h-12 rounded-full relative">
                <Image src="/logo.svg" alt="Petopia" fill priority style={{ objectFit: 'contain' }} />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">Petopia</span>
            </Link>
            <form onSubmit={handleSearch} className="flex-grow max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-6 w-6" />
              </Button>
              {user ? (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt="User Avatar" />
                  <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                </Button>
              )}
            </nav>
          </div>
        </motion.header>
        <div className="container mx-auto px-4 py-8">
          <SkeletonLoader className="h-96 w-full mb-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Header
      User={user}
      Search_Included={true}
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery}
      handleSearch={handleSearch}
      cart = {cart}
      updateQuantity={updateQuantity} 
      removeFromCart={removeFromCart}
      clearCart={clearCart}
      totalItems={totalItems}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                {product.images.length > 1 && (
                  <>
                    <Button 
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10" 
                      size="icon" 
                      variant="ghost"
                      onClick={prevImage}
                      disabled={isAnimating}
                    >
                      <ChevronLeft className="h-6 w-6" />
                      <span className="sr-only">Previous image</span>
                    </Button>
                    <Button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10" 
                      size="icon" 
                      variant="ghost"
                      onClick={nextImage}
                      disabled={isAnimating}
                    >
                      <ChevronRight className="h-6 w-6" />
                      <span className="sr-only">Next image</span>
                    </Button>
                  </>
                )}
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={selectedImage}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0"
                  >
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[selectedImage].image}
                        alt={`${product.name} view`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No image available
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => changeImage(index, index > selectedImage ? 1 : -1)}
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-500 scale-95' : 'border-transparent hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isAnimating}
                    >
                      <Image
                        src={image.image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center mt-4 space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div
            key={rating}
            className="relative group"
            onClick={() => handleStarClick(rating)} // Set user rating on click
          >
            {/* Base Star for Average Rating */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`h-8 w-8 cursor-pointer transition-transform duration-200 ${
                rating <= product.average_rating
                  ? 'fill-yellow-300' // Average rating is a lighter yellow
                  : 'fill-gray-200 hover:fill-yellow-200' // Unselected stars have a subtle hover effect
              }`}
            >
              <path d="M12 .587l3.668 7.431 8.2 1.19-5.917 5.765 1.396 8.127L12 18.897l-7.347 3.863 1.396-8.127-5.917-5.765 8.2-1.19z" />
            </svg>
            {/* User Rating Overlay */}
            {rating <= (userRating || 0) && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="absolute inset-0 h-8 w-8 fill-yellow-500 scale-110"
              >
                <path d="M12 .587l3.668 7.431 8.2 1.19-5.917 5.765 1.396 8.127L12 18.897l-7.347 3.863 1.396-8.127-5.917-5.765 8.2-1.19z" />
              </svg>
            )}
          </div>
        ))}
        <span className="ml-3 text-sm text-gray-500">
          ({product.average_rating || 0}) | {product.user_count || 0} reviews 
        </span>
      </div>


              <div className="p-6 bg-gray-50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Quantity</span>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                    >
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(q => q + 1)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="flex-1 h-12">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12"
                    onClick={handleLike}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isFilled ? 'fill-black' : ''}`}
                    />
                    <span className="sr-only">{isFilled ? 'Remove from favorites' : 'Add to favorites'}</span>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Product Details</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-600">{key}</dt>
                      <dd className="font-medium text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {similarProducts.length > 0 && (
            <div className="border-t">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {similarProducts.map((item) => (
                    <Link key={item.id} href={`/product/${item.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <div className="relative h-48">
                          <Image
                            src={item.images[0]?.image || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-blue-600 font-bold">
                            {parseFloat(item.price).toFixed(2)} грн
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

