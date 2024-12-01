'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, UserCircle, Plus, Minus, Trash2, Search, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header({ 
  cart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  totalItems, 
  User, 
  searchQuery, 
  setSearchQuery, 
  handleSearch,
  Search_Included=false
}) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef(null)
  const router = useRouter()

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

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    Cookies.remove('username')
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full relative">
              <Image src="/logo.svg" alt="Petopia" fill priority style={{ objectFit: 'contain' }} />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">Petopia</span>
          </Link>

          {Search_Included === true && (
            <form onSubmit={handleSearch} className="hidden md:flex relative w-full max-w-sm mx-4">
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </form>
          )}

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Cart */}
            <div className="relative" ref={cartRef}>
              <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(!isCartOpen)}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-96 bg-background rounded-lg shadow-xl z-50 overflow-hidden border border-border"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Your Cart</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Close cart</span>
                        </Button>
                      </div>
                      {cart.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Your cart is empty.</p>
                        </div>
                      ) : (
                        <>
                          <ScrollArea className="h-[300px] pr-4">
                            {cart.map((item) => (
                              <div key={item.id} className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                                <div className="flex items-center space-x-4">
                                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                    <Image src={item.images[0].image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">${Math.floor(item.price)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                          <div className="mt-4 space-y-4">
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Button variant="outline" onClick={clearCart} className="w-full">Clear Cart</Button>
                              <Button className="w-full">Checkout</Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            {User ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={User.avatar} alt="User Avatar" />
                      <AvatarFallback>{User.first_name?.[0]}{User.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => router.push(`/account/${User.username}`)}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/account/orders')}>Orders</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/account/likes')}>Likes</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => router.push('/account/auth')}>
                <UserCircle className="h-5 w-5" />
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

