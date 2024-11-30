'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, UserCircle, Plus, Minus, Trash2, Search, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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
  handleSearch 
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
    <header className="sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full relative">
              <Image src="/logo.svg" alt="Petopia" fill priority style={{ objectFit: 'contain' }} />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">Petopia</span>
          </Link>

          {/* Search Bar */}
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
                    className="absolute right-0 mt-2 w-96 bg-background rounded-md shadow-lg z-50"
                  >
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-4">Your Cart</h2>
                      {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                      ) : (
                        <>
                          <div className="max-h-96 overflow-y-auto">
                            {cart.map((item) => (
                              <div key={item.id} className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">{item.name}</h3>
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
                          <div className="mt-4 flex justify-between">
                            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                            <Button>Checkout</Button>
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
