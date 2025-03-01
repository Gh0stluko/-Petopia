"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, CheckCircle, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/nav";
import Footer from "@/components/footer";
import api from "@/app/services/api";
import Cookies from 'js-cookie';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (Cookies.get('accessToken')) {
          const response = await api.get('/user/me/')
          setUser(response.data)
          
          // Pre-fill form with user data if available
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    fetchUserData()
  }, [])
  useEffect(() => {
    // Check if user is logged in
    const accessToken = Cookies.get('accessToken');
    setIsLoggedIn(!!accessToken);

    const fetchOrderDetails = async () => {
      try {
        // Get order ID from localStorage
        const orderId = localStorage.getItem("last_order_id");

        if (!orderId) {
          // If no order ID, redirect to home
          router.push("/");
          return;
        }

        // Fetch order details from API
        const response = await api.get(`/orders/${orderId}/`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header Search_Included={false} User={user} />
        <div className="container mx-auto py-16 px-4 flex-1 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header Search_Included={false} />
        <div className="container mx-auto py-16 px-4 flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-center mb-4">Замовлення не знайдено</h1>
          <p className="text-muted-foreground text-center mb-8">
            Вибачте, але інформація про ваше замовлення недоступна.
          </p>
          <Button asChild>
            <Link href="/">Повернутися на головну</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header Search_Included={false} />
      
      <div className="container mx-auto py-16 px-4 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-green-100 p-4 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Дякуємо за замовлення!</h1>
            <p className="text-xl text-muted-foreground">
              Ваше замовлення №{order.id} було успішно оформлено.
            </p>
          </div>

          <Card className="mb-8 overflow-hidden border-0 shadow-md">
            <div className="bg-primary/10 py-4 px-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Інформація про замовлення</h2>
                <span className="text-sm font-medium px-3 py-1 bg-primary/20 rounded-full">
                  {order.status === "pending" ? "Очікує обробки" : order.status}
                </span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Контактна інформація</h3>
                  <p className="font-semibold mb-1">
                    {order.first_name} {order.last_name}
                  </p>
                  <p className="mb-1">{order.email}</p>
                  <p>{order.phone}</p>
                </div>

                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Доставка</h3>
                  <p className="font-semibold mb-1">{order.shipping_city}</p>
                  <p>{order.shipping_address}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-muted-foreground mb-4">Товари у замовленні</h3>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between pb-3 border-b cursor-pointer hover:bg-gray-50 transition-colors" 
                      onClick={() => router.push(`/product/${item.product_id}`)}
                    >
                      <div className="flex items-center">
                        <Package className="h-10 w-10 p-2 bg-muted rounded-md mr-3" />
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Кількість: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} грн
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Спосіб оплати</span>
                  <span>
                    {order.payment_method === "cash"
                      ? "Накладений платіж"
                      : "Онлайн оплата"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Загальна сума</span>
                  <span className="text-xl font-bold">
                    {Number(order.total_amount).toFixed(2)} грн
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Show different buttons based on authentication status */}
          {isLoggedIn ? (
            <div className="mt-10">
              <Button asChild size="lg" className="w-full h-16">
                <Link href="/account/orders" className="flex items-center justify-center gap-2">
                  <span>Мої замовлення</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-10">
              <Button asChild size="lg" className="w-full h-16">
                <Link href="/" className="flex items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Продовжити покупки</span>
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-10 bg-primary/5 rounded-lg p-6">
            <div className="flex gap-4 items-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Відстежуйте статус вашого замовлення</h3>
                <p className="text-sm text-muted-foreground">
                  Ви отримаєте електронний лист з підтвердженням та інформацією про відстеження.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}