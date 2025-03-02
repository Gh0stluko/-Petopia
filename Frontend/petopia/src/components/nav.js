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
import CartComponent from "@/components/CartComponent"
import { useCart } from '@/contexts/CartContext'
import api from '@/app/services/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch,
  Search_Included=false,
}) {
  const { toggleCart, totalItems, isCartOpen } = useCart()
  const router = useRouter()
  const [User, setUser] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (Cookies.get('accessToken')) {
          const response = await api.get('/user/me/')
          setUser(response.data)
          
          // Pre-fill form with user data if available
        }
      } catch (error) {
        console.error('Помилка отримання даних користувача:', error)
      }
    }
    
    fetchUserData()
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
                placeholder="Пошук товарів..."
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
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCart();
                }}
                className={isCartOpen ? "bg-muted" : ""}
                data-cart-toggle="true"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Button>
              <CartComponent />
            </div>

            {/* User Menu */}
            {User ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={User.avatar} alt="Аватар користувача" />
                      <AvatarFallback>{User.first_name?.[0]}{User.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Мій обліковий запис</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => router.push(`/account/${User.username}`)}>Профіль</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/account/orders')}>Мої замовлення</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push('/account/likes')}>Вподобане</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Вийти</DropdownMenuItem>
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

