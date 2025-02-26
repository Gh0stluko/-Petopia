'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from "@/components/ui/button"
import Header from '@/components/nav'
import Footer from '@/components/footer'
import { useToast } from "@/hooks/use-toast"
import Link from 'next/link'
import { CartItem } from '@/components/CartItem'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart()
  const { toast } = useToast()
  const [user, setUser] = useState(null)

  const handleRemoveItem = (item) => {
    removeFromCart(item.id, (removedItem) => {
      toast({
        title: "Item removed",
        description: `${removedItem.name} has been removed from your cart`,
        status: "info"
      })
    })
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header User={user} Search_Included={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products">
              <Button>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header User={user} Search_Included={true} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-sm"
              >
                <CartItem
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={handleRemoveItem}
                />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 