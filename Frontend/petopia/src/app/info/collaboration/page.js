'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Mail, Phone, MapPin, Clock, ExternalLink } from 'lucide-react'
import Header from '@/components/nav'
import Footer from '@/components/footer'
import { useToast } from "@/hooks/use-toast"
import Cookies from 'js-cookie'
import api from '@/app/services/api'

export default function CollaborationPage() {
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const [imageError, setImageError] = useState(false)
  
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Скопійовано!",
          description: "Електронну адресу скопійовано до буфера обміну",
        })
      },
      () => {
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Не вдалося скопіювати електронну адресу",
        })
      }
    )
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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Співпраця з Petopia</h1>
            <p className="text-lg text-gray-600">
              Ми завжди відкриті для нових можливостей партнерства та співпраці
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Зв'яжіться з нами</CardTitle>
                  <CardDescription>
                    Для запитів щодо співпраці, будь ласка, надсилайте листи на нашу офіційну пошту:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                    <div className="flex-grow">
                      <p className="font-medium">Електронна пошта:</p>
                      <p className="text-blue-600">collaboration@petopia.com</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => copyToClipboard('collaboration@petopia.com')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Копіювати
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Ми розглядаємо наступні типи співпраці:</h3>
                    <ul className="space-y-2 list-disc pl-5 text-gray-700">
                      <li>Постачання продукції для тварин</li>
                      <li>Маркетингові партнерства</li>
                      <li>Благодійні проєкти та спонсорство</li>
                      <li>Ветеринарне партнерство</li>
                      <li>Інші форми співпраці</li>
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">
                      В листі, будь ласка, вкажіть:
                    </p>
                    <ul className="text-sm text-gray-500 list-disc pl-5">
                      <li>Назву вашої компанії/організації</li>
                      <li>Тип бажаного партнерства</li>
                      <li>Короткий опис вашої пропозиції</li>
                      <li>Контактні дані для зворотного зв'язку</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card className="flex-grow">
                <CardHeader>
                  <CardTitle>Наші контактні дані</CardTitle>
                  <CardDescription>
                    Додаткові способи зв'язатися з нами
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* 
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Телефон:</p>
                      <p>+380 (44) 123-45-67</p>
                    </div>
                  </div>
                */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Адреса:</p>
                      <p>м. Львів</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Години роботи:</p>
                      <p>Пн-Пт: 9:00-18:00</p>
                      <p>Сб-Нд: Вихідні</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <ExternalLink className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Корисні посилання</h3>
                  </div>
                  <div className="space-y-2">
                    <Button variant="link" className="p-0 h-auto text-primary" onClick={() => router.push('/info/about')}>
                      Про компанію
                    </Button>
                    <div className="flex justify-between">
                      <Button variant="link" className="p-0 h-auto text-primary" onClick={() => router.push('/info/shipping')}>
                        Доставка та оплата
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>


          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Ми цінуємо кожну пропозицію і зазвичай відповідаємо протягом 2-3 робочих днів.
            </p>
            <Button size="lg" onClick={() => window.location.href = 'mailto:collaboration@petopia.com'}>
              <Mail className="mr-2 h-5 w-5" />
              Написати на пошту
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
