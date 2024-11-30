'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "../components/ui/button"
import { ShoppingCart, UserCircle, Plus, Minus, Trash2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { Search } from 'lucide-react'

export default function Header({ cart, updateQuantity, removeFromCart, clearCart, totalItems, User, searchQuery, setSearchQuery, handleSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('username');
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="w-16 h-16 rounded-full relative">
          <Image src="/logo.svg" alt="Petopia" fill priority style={{ objectFit: 'contain' }} />
        </div>
        <nav className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
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
                  onClick={handleLogout}
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
  )
}

