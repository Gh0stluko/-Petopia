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
import Footer from '@/components/footer'
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
import CustomBackgroundDecoration from "@/components/BackgroundDecoration"
const SkeletonLoader = ({ height, width, className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ height, width }}></div>
);

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
  
  useEffect(() => {
    setCategories([...animalCategories, ...itemCategories])
  }, [animalCategories, itemCategories])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=true&q=${searchQuery}`)
    }
  }

  const getCategoryType = (category) => {
    if (!category || !category.id) {
      return 'unknown';
    }
  
    // More strict comparison checking both id and name
    const isInAnimal = animalCategories.some(ac => 
      ac.id === category.id && ac.name === category.name
    );
    const isInItem = itemCategories.some(ic => 
      ic.id === category.id && ic.name === category.name
    );
  
    if (isInAnimal) return 'animal';
    if (isInItem) return 'item';
    return 'unknown';
  };

  return (
    <div className="min-h-screen">
        <CustomBackgroundDecoration />

      <Header
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
                      <Snowfall color="white" snowflakeCount={50} />
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
      <NewProducts 
        products={[
          ...products.filter(product => product.stock > 0),
          ...products.filter(product => product.stock === 0)
        ]} 
        handlewishlist={handlewishlist} 
        isHeartClicked={isHeartClicked} 
        title = "New products" 
        isLoading={isLoading} 
      />

      {/* Dogs products */}
      <NewProducts 
        products={[
          ...products.filter(product => 
            product.Animal_Category.some(category => category.name.toLowerCase() === 'dogs') && 
            product.stock > 0
          ),
          ...products.filter(product => 
            product.Animal_Category.some(category => category.name.toLowerCase() === 'dogs') && 
            product.stock === 0
          )
        ]}
        handlewishlist={handlewishlist} 
        isHeartClicked={isHeartClicked}
        title={"Dog's products"}
        isLoading={isLoading}
        href='products?animal_category=dogs'
      />

      {/* Cat products */}
      <NewProducts 
        products={[
          ...products.filter(product => 
            product.Animal_Category.some(category => category.name.toLowerCase() === 'cats') && 
            product.stock > 0
          ),
          ...products.filter(product => 
            product.Animal_Category.some(category => category.name.toLowerCase() === 'cats') && 
            product.stock === 0
          )
        ]}
        handlewishlist={handlewishlist} 
        isHeartClicked={isHeartClicked}
        title={"Cat's products"}
        isLoading={isLoading}
        href='products?animal_category=cats'
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
                    <Card
                     className="group cursor-pointer"
                    onClick={() => {
                      const categoryType = getCategoryType(category);
                      console.log('Category:', category.name, 'Type:', getCategoryType(category));
                      const routeParam = categoryType === 'animal' ? 'animal_category' : 'item_category';
                      router.push(`/products?${routeParam}=${category.name.toLowerCase()}`);
                    }}>
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

