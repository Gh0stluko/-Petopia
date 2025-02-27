'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams ,useRouter} from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Search, UserCircle, Filter } from 'lucide-react';
import api from '@/app/services/api';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce, set } from 'lodash';
import {Slider, user} from "@nextui-org/react";
import Header from '@/components/nav';
import Cookies from 'js-cookie';
import Footer from '@/components/footer';
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
import { ProductCard } from '@/components/ProductComponent';
import { Cookie } from 'next/font/google';

const SkeletonLoader = ({ height, width, className }) => (
  <div 
    className={`animate-pulse bg-gray-200 rounded ${className}`} 
    style={{ height, width }}
  />
);

const ITEMS_PER_PAGE = 20;

// Move debounce outside to prevent re-creation
const debouncedFetch = debounce((fetchFunction) => {
  fetchFunction();
}, 500);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [animalCategories, setAnimalCategories] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [selectedAnimalCategories, setSelectedAnimalCategories] = useState(() => {
    const categoryParam = searchParams.get('animal_category');
    if (categoryParam) {
      // Handle both array and string cases
      return typeof categoryParam === 'string' 
        ? categoryParam.split(',')
        : Array.isArray(categoryParam) 
          ? categoryParam 
          : [];
    }
    return [];
  });
  const [selectedItemCategories, setSelectedItemCategories] = useState(() => {
    const categoryParam = searchParams.get('item_category');
    if (categoryParam) {
      // Handle both array and string cases
      return typeof categoryParam === 'string' 
        ? categoryParam.split(',')
        : Array.isArray(categoryParam) 
          ? categoryParam 
          : [];
    }
    return [];
  });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('relevance');
  const [User, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isHeartClicked, setIsHeartClicked] = useState(false);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false)
  const [wishlist, setWishlist] = useState({});
  const { ref, inView } = useInView({
    threshold: 0,
  });

  
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!User){
        return;
      }
      try {
        const wishresponse = await api.get('/user/me/');
        const wishlistData = wishresponse.data.wishlist;
        setUser(wishresponse.data);
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
  
  }, []);
  
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
  const fetchData = useCallback(async (sortBy) => {
    setIsLoading(true);
    try {
      const animalCategoriesResponse = await api.get('/animal_categories/');
      const itemCategoriesResponse = await api.get('/item_categories/');
      const maxPriceResponse = await api.get('/products/max_price/');

      if (User) {
        const userResponse = await api.get('/user/me/');
        setUser(userResponse.data);
      }
      setMaxPrice(maxPriceResponse.data.max_price);
      setAnimalCategories(animalCategoriesResponse.data);
      setItemCategories(itemCategoriesResponse.data);
      if (isFirstLoad) {
        setPriceRange({ min: 0, max: maxPriceResponse.data.max_price });
        setIsFirstLoad(false);
      }

      const url = new URL(window.location.href);
      if (searchQuery && searchQuery.trim()) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }
      router.replace(url.toString(), undefined, { shallow: true });
      
      const filters = {
        ...(searchQuery && searchQuery.trim() ? { search: searchQuery } : { search: "" }),
        animal_category: selectedAnimalCategories.length ? selectedAnimalCategories.join(',') : [],
        item_category: selectedItemCategories.length ? selectedItemCategories.join(',') : [],
        min_price: priceRange.min,
        max_price: priceRange.max,
        sort_by: sortBy,
      };
      const filteredResponse = await api.get('/products/', { params: filters });
      setSearchResults(filteredResponse.data);
      setFilteredResults(filteredResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  }, [searchQuery, selectedAnimalCategories, selectedItemCategories, priceRange, sortBy, User]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedFetch(fetchData);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    setDisplayedResults(filteredResults.slice(0, page * ITEMS_PER_PAGE));
  }, [filteredResults, page]);

  useEffect(() => {
    if (inView) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView]);

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, []);



  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleAnimalCategoryChange = (category, checked) => {
    setSelectedAnimalCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };
  const handleItemCategoryChange = (category, checked) => {
    setSelectedItemCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const applyFilters = () => {
    fetchData();
    setIsFilterOpen(false);
  };
  const clearFilters = () => {
    setPriceRange({ min: 0, max: maxPrice });
    setSelectedAnimalCategories([]);
    setSelectedItemCategories([]);
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header Search_Included={true} User={User} cart={cart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h1>
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="transition-all duration-200 hover:shadow-md"
          >
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative">
          <AnimatePresence mode="sync">
            {isFilterOpen && (
              <motion.aside 
                className="absolute md:relative z-10 w-full md:w-64 bg-white p-4 rounded-lg shadow-lg"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  type: "tween",
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                <div className="sticky top-4">
                  <h2 className="font-semibold mb-4">Filters</h2>
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Animal Categories</h3>
                      <div className="space-y-2">
                        {animalCategories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <Checkbox
                              id={`animal-${category.id}`}
                              checked={selectedAnimalCategories?.includes(category.name)}
                              onCheckedChange={(checked) => handleAnimalCategoryChange(category.name, checked)}
                            />
                            <label htmlFor={`animal-${category.id}`} className="ml-2 text-sm cursor-pointer">{category.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Item Categories</h3>
                      <div className="space-y-2">
                        {itemCategories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <Checkbox
                              id={`item-${category.id}`}
                              checked={selectedItemCategories.includes(category.name)}
                              onCheckedChange={(checked) => handleItemCategoryChange(category.name, checked)}
                            />
                            <label htmlFor={`item-${category.id}`} className="ml-2 text-sm cursor-pointer">{category.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Price Range</h3>
                      <div className="flex gap-2 mb-4">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="w-1/2"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="w-1/2"
                        />
                      </div>
                      <Slider
                        label="Price Range"
                        step={1}
                        minValue={0}
                        maxValue={maxPrice}
                        value={[priceRange.min, priceRange.max]}
                        onChange={(values) =>
                          setPriceRange({ min: values[0], max: values[1] })
                        }
                        formatOptions={{ style: 'currency', currency: 'USD' }}
                        className="max-w-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-primary" 
                        onClick={applyFilters}
                      >
                        Apply Filters
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={clearFilters}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-grow">
            <div className="mb-4 flex justify-between items-center">
              <span className="text-gray-600">{filteredResults.length} results</span>
              <select
                value={sortBy}
                onChange={(e) => {setSortBy(e.target.value); fetchData(e.target.value)}}
                className="border rounded-lg p-2 bg-white shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <SkeletonLoader className="h-48 w-full" />
                    <CardContent className="p-4">
                      <SkeletonLoader className="h-6 w-3/4 mb-2" />
                      <SkeletonLoader className="h-4 w-1/4 mb-2" />
                      <SkeletonLoader className="h-4 w-1/2 mb-4" />
                      <SkeletonLoader className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedResults.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              >
                {displayedResults.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="transition-transform duration-200 hover:shadow-lg"
                  >
                    <ProductCard product={product} handlewishlist={handlewishlist} isHeartClicked={isHeartClicked} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center text-gray-600 mt-8">
                {searchQuery
                  ? `No results found for "${searchQuery}". Please try a different search term or adjust your filters.`
                  : "No products available. Please check back later or adjust your filters."}
              </div>
            )}

            {displayedResults.length < filteredResults.length && (
              <div ref={ref} className="flex justify-center mt-8">
                <SkeletonLoader className="h-10 w-32" />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Login Required</AlertDialogTitle>
                    <AlertDialogDescription>
                      You need to be logged in to add items to your wishlist. Would you like to log in now?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className='flex justify-center items-center'>
                    <AlertDialogCancel onClick={() => setModalOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push('/account/auth/')}>Log In</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}