'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/simple-accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, RefreshCcw, FileText, ShieldCheck, Clock, MapPin, CreditCard, Mail } from 'lucide-react'
import Header from '@/components/nav'
import Footer from '@/components/footer'
import Cookies from 'js-cookie'
import api from '@/app/services/api'

export default function ShippingAndReturnsPage() {
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (Cookies.get('accessToken')) {
          const response = await api.get('/user/me/')
          setUser(response.data)
        }
      } catch (error) {
        console.error('Помилка отримання даних користувача:', error)
      }
    }
    
    fetchUserData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=true&q=${searchQuery}`)
    }
  }

  const getCartFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('cart')
      return cart ? JSON.parse(cart) : []
    }
    return []
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        User={user} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        cart={getCartFromLocalStorage}
        Search_Included={true}
      />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Доставка та повернення товарів</h1>

          <Tabs defaultValue="shipping" className="w-full mb-12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shipping">Доставка</TabsTrigger>
              <TabsTrigger value="returns">Повернення та обмін</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-6 w-6 mr-2" />
                    Інформація про доставку
                  </CardTitle>
                  <CardDescription>
                    Ми пропонуємо доставку Новою Поштою для максимального комфорту наших клієнтів
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Card className="border-l-4 border-blue-500">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center">
                          <Truck className="h-5 w-5 mr-2 text-blue-500" />
                          Нова Пошта
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                          <li>Доставка по всій Україні</li>
                          <li>Термін доставки: 1-2 робочі дні</li>
                          <li>Вартість доставки згідно з тарифами перевізника</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Важлива інформація</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Термін обробки замовлення</p>
                          <p className="text-gray-600">Замовлення обробляються протягом 1 дня після оплати.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Зони доставки</p>
                          <p className="text-gray-600">Ми доставляємо товари по всій території України, за винятком тимчасово окупованих територій.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <CreditCard className="h-5 w-5 mr-3 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Способи оплати</p>
                          <p className="text-gray-600">Оплата при отриманні (накладений платіж) або онлайн-оплата (банківська карта, Apple Pay, Google Pay).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Безкоштовна доставка</h4>
                    <p className="text-blue-700">Для замовлень на суму понад 1500 грн доставка безкоштовна.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="returns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCcw className="h-6 w-6 mr-2" />
                    Повернення та обмін товарів
                  </CardTitle>
                  <CardDescription>
                    Політика повернення товарів відповідає Закону України "Про захист прав споживачів"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 p-5 rounded-lg mb-6">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Процедура повернення
                    </h4>
                    <p className="text-blue-700">
                      Для повернення або обміну товару, будь ласка, зверніться на нашу електронну пошту 
                      <a href="mailto:returns@petopia.com" className="font-medium underline ml-1">returns@petopia.com</a>
                      . Наші спеціалісти оперативно розглянуть вашу заявку та нададуть детальні інструкції щодо подальших дій.
                    </p>
                  </div>
                  
                  <Accordion type="single" collapsible={true} className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-lg font-medium">
                        Умови повернення товару належної якості
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 space-y-3">
                        <p>Відповідно до статті 9 Закону України "Про захист прав споживачів", Ви маєте право обміняти або повернути товар належної якості протягом 14 днів з моменту придбання, якщо:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Товар не був у використанні</li>
                          <li>Збережено товарний вигляд, споживчі властивості, пломби, ярлики</li>
                          <li>Наявний товарний або касовий чек (або інший документ, що підтверджує факт покупки)</li>
                        </ul>
                        <div className="bg-amber-50 p-4 rounded-md mt-3">
                          <p className="text-amber-800 font-medium">Важливо!</p>
                          <p className="text-amber-700">Повернення товарів для тварин регулюється особливими умовами. Корми, ліки, та товари з порушеною упаковкою поверненню або обміну не підлягають.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-lg font-medium">
                        Повернення неякісного товару
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 space-y-3">
                        <p>Згідно зі статтями 8 та 10 Закону України "Про захист прав споживачів", у разі виявлення недоліків у товарі протягом гарантійного терміну, Ви маєте право на:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Обмін товару на аналогічний товар належної якості</li>
                          <li>Відповідне зменшення ціни товару</li>
                          <li>Безоплатне усунення недоліків товару</li>
                          <li>Відшкодування витрат на усунення недоліків товару</li>
                          <li>Повернення сплаченої за товар суми</li>
                        </ul>
                        <p>Гарантійний термін на більшість товарів становить 14 днів з моменту придбання, якщо інше не зазначено виробником.</p>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-lg font-medium">
                        Товари, що не підлягають поверненню
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 space-y-3">
                        <p>Відповідно до Постанови КМУ від 19 березня 1994 р. № 172 "Про реалізацію окремих положень Закону України «Про захист прав споживачів»", наступні товари не підлягають поверненню або обміну:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Корми для тварин</li>
                          <li>Ветеринарні препарати та ліки</li>
                          <li>Предмети особистої гігієни для тварин</li>
                          <li>Товари, що були у використанні</li>
                          <li>Розпаковані засоби проти паразитів</li>
                          <li>Живі тварини та рослини</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="bg-green-50 p-5 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Наші гарантії
                    </h4>
                    <p className="text-green-700">Ми завжди прагнемо вирішувати будь-які питання на користь наших клієнтів та надаємо повну консультаційну підтримку з питань повернення та обміну товарів. Якщо у вас виникли питання, звертайтеся до нашої служби підтримки.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center mt-8">
            <h2 className="text-xl font-semibold mb-3">Залишилися питання?</h2>
            <p className="text-gray-600 mb-6">Наші фахівці з радістю проконсультують вас з будь-яких питань доставки та повернення товарів</p>
            <Button 
              onClick={() => router.push('/info')}
              className="px-6"
            >
              Зв'язатися з нами
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
