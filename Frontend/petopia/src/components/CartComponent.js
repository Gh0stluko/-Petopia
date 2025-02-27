'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2, X, Router } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useToast } from "@/hooks/use-toast"
import Link from 'next/link'

export default function CartComponent() {
  const { 
    cart, 
    isCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalItems, 
    totalPrice,
    closeCart 
  } = useCart()
  const router = useRouter()
  
  const { toast } = useToast()
  const cartRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (isCartOpen && cartRef.current && !cartRef.current.contains(event.target) && 
          !event.target.closest('[data-cart-toggle]')) {
        closeCart()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [closeCart, isCartOpen])

  const handleRemoveFromCart = (item) => {
    removeFromCart(item.id, (removedItem) => {
      toast({
        title: "Item removed",
        description: `${removedItem.name} has been removed from your cart`,
        status: "info"
      })
    })
  }

  const handleClearCart = () => {
    clearCart(() => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        status: "info"
      })
    })
  }
  const handleCheckout = () => {
    closeCart()
    router.push('/cart')
  }
  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-96 bg-background rounded-lg shadow-xl z-50 overflow-hidden border border-border"
          ref={cartRef}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Your Cart</h2>
              <Button variant="ghost" size="icon" onClick={closeCart}>
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
                          <Link 
                            href={`/product/${item.id}`} 
                            className="hover:text-primary transition-colors"
                            onClick={() => closeCart()}
                          >
                            <h3 className="font-semibold">{item.name}</h3>
                          </Link>
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
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleClearCart} className="w-full">Clear Cart</Button>
                    <Button onClick={handleCheckout} className="w-full">Checkout</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 