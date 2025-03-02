'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Users, Award, Smile, Shield, MapPin, Mail, Phone } from 'lucide-react'
import Header from '@/components/nav'
import Footer from '@/components/footer'
import Cookies from 'js-cookie'
import api from '@/app/services/api'

export default function AboutPage() {
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  // Add state for images that fail to load
  const [heroImageError, setHeroImageError] = useState(false);
  const [storyImageError, setStoryImageError] = useState(false);
  
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
      
      <main className="flex-grow">
        {/* Hero Section - Simplified without dog image */}
        <section className="relative bg-gradient-to-r from-teal-600 to-indigo-600 text-white py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            {!heroImageError ? (
              <Image 
                src="/about-hero.jpg" 
                alt="Домашні тварини" 
                fill 
                className="object-cover"
                onError={() => setHeroImageError(true)}
              />
            ) : null}
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Про Petopia</h1>
              <p className="text-xl opacity-90">Ми прагнемо зробити життя домашніх тварин та їх власників кращим, пропонуючи якісні товари та обслуговування з любов'ю.</p>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Наша місія та цінності</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ми присвятили себе турботі про добробут домашніх тварин та поглибленню зв'язку між ними та їхніми власниками.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Турбота і любов</h3>
                  <p className="text-gray-600">
                    Ми обираємо продукти, які відображають нашу відданість благополуччю тварин та зобов'язання забезпечувати рішення, що підтримують їхнє щасливе, здорове життя.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-t-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Якість і довіра</h3>
                  <p className="text-gray-600">
                    Ми прискіпливо відбираємо товари найвищої якості, яким ви можете довіряти. Наша репутація базується на чесності, надійності та прозорості у всіх аспектах нашого бізнесу.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-t-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Спільнота</h3>
                  <p className="text-gray-600">
                    Ми будуємо міцні зв'язки з любителями тварин, ветеринарами та партнерами, щоб створити спільноту, яка піклується про тварин і допомагає власникам домашніх улюбленців.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Чому обирають нас</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Petopia відрізняється від інших магазинів не лише широким асортиментом товарів, але й особливим підходом до клієнтів та їхніх улюбленців.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Якісні товари</h3>
                <p className="text-gray-600">
                  Ретельно відібрані бренди та продукти, що пройшли контроль якості та відповідають найвищим стандартам.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                  <Smile className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Професійна консультація</h3>
                <p className="text-gray-600">
                  Наші спеціалісти завжди готові допомогти з вибором товарів та надати поради щодо догляду за вашими улюбленцями.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Швидка доставка</h3>
                <p className="text-gray-600">
                  Доставляємо замовлення по всій Україні в найкоротші терміни, щоб ваші улюбленці не чекали.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Лояльність клієнтів</h3>
                <p className="text-gray-600">
                  Особливі пропозиції та акції для постійних клієнтів, програма лояльності та персональні знижки.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA - simplified to remove details */}
        <section className="py-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Маєте запитання чи пропозиції?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Наша команда завжди рада почути від вас. Зв'яжіться з нами будь-яким зручним способом.
            </p>
            
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => router.push('/info')}
            >
              Зв'язатися з нами
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
