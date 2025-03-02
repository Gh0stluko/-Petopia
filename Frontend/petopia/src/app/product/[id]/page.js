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
import { useCart } from '@/contexts/CartContext';
import Cookies from 'js-cookie';
import { set } from 'lodash';
const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);
import Footer from '@/components/footer';
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
  const { toast } = useToast();
  const { addToCart, addToCartWithQuantity, cart } = useCart();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [wishlist, setWishlist] = useState({})
  const [isHeartClicked, setIsHeartClicked] = useState({})
  
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!user) {
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
        console.log(heartState)
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
  
    fetchWishlist();
  }, [user]);

  const handlewishlist = async (id) => {
    if (!user) {
      toast({
        title: 'You need to be logged in to submit a review.',
        status: 'error',
      });
      return;
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
  const handleStarClick = async (rating) => {
    if (!user) {
      toast({
        title: 'Для додавання відгуку необхідно увійти в систему.',
        status: 'error',
      });
      return;
    }
    setUserRating(rating);
    try {
      await api.post(`/products/1/rate/`, { rating });
      toast({
        title: 'Дякуємо за ваш відгук!',
        status: 'success',
      });
    } catch (error) {
      console.error('Помилка надсилання відгуку:', error);
      toast({
        title: 'Не вдалося надіслати відгук',
        status: 'error',
      });
    }
  };
  const handleLike = () => {
    setIsFilled(!isFilled);
    toast({
      title: isFilled ? 'Видалено з обраного' : 'Додано до обраного',
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
        console.log(productResponse.data);
        const similarResponse = await api.get('/products/', {
          params: {
            category: productResponse.data.animal_category?.id,
            exclude: params.id,
            limit: 4
          }
        });
        const filteredSimilarProducts = similarResponse.data.filter(
          (item) => item.id !== parseInt(params.id)
        );
        setSimilarProducts(filteredSimilarProducts);
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
          const userRes = await api.get('/user/me/');
          setUser(userRes.data);
          const userreview = await api.get(`/user/get_reviews/`);
          setUserRating(userreview.data[0].rating);
        }
        console.log(similarResponse.data[0].id);
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

  // Add this function to check if product is in cart
  const getCartItem = () => {
    return cart.find(item => item.id === product.id);
  };

  // Update the handleAddToCart function
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCartWithQuantity(product, 1, (addedProduct, wasInCart, qty) => {
      toast({
        title: `${addedProduct.name} додано до вашого кошика`,
        description: `Товар додано до вашого кошика`,
        status: "success"
      });
    });
  };

  if (isLoading || !product) {
    return (

      <div className="min-h-screen bg-gray-50">
        <motion.header className="sticky top-0 з-50 bg-white shadow-sm">
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
                  placeholder="Пошук товарів..."
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
                  <AvatarImage src={user.avatar} alt="Аватар користувача" />
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
                      <span className="sr-only">Попереднє зображення</span>
                    </Button>
                    <Button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10" 
                      size="icon" 
                      variant="ghost"
                      onClick={nextImage}
                      disabled={isAnimating}
                    >
                      <ChevronRight className="h-6 w-6" />
                      <span className="sr-only">Наступне зображення</span>
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
                        alt={`${product.name} фото`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        Зображення недоступне
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
                        alt={`${product.name} фото ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                {/* Product Title, Categories and Price */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.Animal_Category?.map((category) => (
                      <Link 
                        key={`animal-${category.id}`}
                        href={`/products?animal_category=${category.name?.toLowerCase() || category.name}`}
                        className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 
                        rounded-full text-sm hover:from-purple-500/30 hover:to-pink-500/30 transition-all 
                        duration-300 ease-in-out border border-purple-200 shadow-sm hover:shadow-md"
                      >
                        🐾 {category.name}
                      </Link>
                    ))}
                    {product.Item_Category?.map((category) => {
                      if (!category || !category.name) {
                        console.log('Invalid category:', category);
                        return null;
                      }
                      return (
                        <Link 
                          key={`item-${category.id}`}
                          href={`/products?item_category=${category.name}`}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 
                          rounded-full text-sm hover:from-blue-500/30 hover:to-cyan-500/30 transition-all 
                          duration-300 ease-in-out border border-blue-200 shadow-sm hover:shadow-md"
                        >
                          ✨ {category.name}
                        </Link>
                      );
                    })}
                  </div>
                  <h1 className="text-2xl font-medium text-gray-800 mb-2 leading-relaxed">{product.name}</h1>
                  
                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {Math.floor(product.price)} грн
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-lg text-gray-500 line-through">
                            {Math.floor(product.price * (1 + product.discount/100))} грн
                          </span>
                          <span className="text-sm font-semibold text-green-500">
                            знижка {product.discount}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    {product.brand && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Бренд:</span>
                        <span className="font-medium text-gray-900">{product.brand}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Артикул:</span>
                        <span className="font-medium text-gray-900">{product.sku}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-4 4l-4 4m0-4l4 4" />
                      </svg>
                      <span>Безкоштовна доставка для замовлень понад 1500 грн</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>14-денна гарантія повернення</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="py-4 border-t mt-4">
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span className="text-sm font-medium text-green-600">В наявності</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          <span className="text-sm font-medium text-red-600">Немає в наявності</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    {getCartItem() ? (
                      <Button 
                        className="flex-1 h-12"
                        variant="outline"
                        onClick={() => router.push('/cart')}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Переглянути в кошику
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1 h-12 relative group"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                      >
                        <span className="absolute inset-0 bg-white/10 group-hover:scale-x-100 scale-x-0 transition-transform origin-left duration-300"></span>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {product.stock > 0 ? 'Додати до кошика' : 'Немає в наявності'}
                      </Button>
                    )}

                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12 relative group"
                      onClick={() => {
                        handlewishlist(product.id);
                        if (!user) {
                          toast({
                            title: 'Увійдіть, щоб додати до списку бажань',
                            status: 'error',
                          });
                          return;
                        }
                        else{
                          toast({
                            title: isHeartClicked[product.id] ? 'Видалено зі списку бажань' : 'Додано до списку бажань',
                            status: isHeartClicked[product.id] ? 'error' : 'success',
                          });
                        }
                      }}
                    >
                      <Heart 
                        className={`h-5 w-5 transition-colors duration-300 ${isHeartClicked[product.id] ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      <span className="sr-only">
                        {isHeartClicked[product.id] ? 'Видалити з улюблених' : 'Додати до улюблених'}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Product Features */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-4">Особливості товару</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Якість виробника</span>
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-4">Опис товару</h3>
                  <div className="relative">
                    <p className={`text-gray-700 whitespace-pre-wrap break-words ${
                      showFullDescription ? '' : 'line-clamp-3'
                    }`}>
                      {product.description}
                    </p>
                    {product.description && product.description.length > 100 && (
                      <button
                        onClick={toggleDescription}
                        className="text-primary hover:text-primary/80 mt-2 text-sm font-medium"
                      >
                        {showFullDescription ? 'Показати менше' : 'Показати більше'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {similarProducts.length > 0 && (
                <div className="border-t mt-8">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6">Схожі товари</h2>
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
      <Footer/>
      <Toaster />
    </div>
  );
}
