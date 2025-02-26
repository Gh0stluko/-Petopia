'use client'

import { useRef, useEffect } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useToast } from "@/hooks/use-toast"
import { CartItem } from './CartItem'

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
                    <div key={item.id} className="mb-4 pb-4 border-b border-border">
                      <CartItem
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={handleRemoveFromCart}
                        size="small"
                        onLinkClick={closeCart}
                      />
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
                    <Button className="w-full">Checkout</Button>
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