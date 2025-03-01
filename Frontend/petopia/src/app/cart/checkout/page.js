'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, CreditCard, MapPin, BadgeCheck, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import api from '@/app/services/api'
import Cookies from 'js-cookie'
import Header from '@/components/nav'
import Footer from '@/components/footer'

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [cities, setCities] = useState([])
  const [branches, setBranches] = useState([])
  const [searchBranch, setSearchBranch] = useState('')
  const [activeTab, setActiveTab] = useState("shipping")
  const [isShippingValid, setIsShippingValid] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    branch: '',
    saveInfo: false,
    paymentMethod: 'cash'  // default to cash on delivery
  })


  // Validation logic
  useEffect(() => {
    const isValid = !!(
      formData.firstName && 
      formData.lastName && 
      formData.email && 
      formData.phone && 
      formData.city &&
      formData.branch
    )
    setIsShippingValid(isValid)
  }, [formData])
  
  // Form validation with error display
  const validateShippingForm = () => {
    if (!formData.firstName) {
      toast({ title: "Required field", description: "Please enter your first name", variant: "destructive" })
      return false
    }
    if (!formData.lastName) {
      toast({ title: "Required field", description: "Please enter your last name", variant: "destructive" })
      return false
    }
    if (!formData.email) {
      toast({ title: "Required field", description: "Please enter your email", variant: "destructive" })
      return false
    }
    if (!formData.phone) {
      toast({ title: "Required field", description: "Please enter your phone number", variant: "destructive" })
      return false
    }
    if (!formData.city) {
      toast({ title: "Required field", description: "Please select a delivery city", variant: "destructive" })
      return false
    }
    if (!formData.branch) {
      toast({ title: "Required field", description: "Please select a Nova Poshta branch", variant: "destructive" })
      return false
    }
    return true
  }
  
  // Handle tab changes with validation
  const handleTabChange = (value) => {
    if (value === "payment") {
      if (!validateShippingForm()) {
        return
      }
    }
    setActiveTab(value)
  }
  
  // City search through Nova Poshta API
  const fetchCities = async (search = '') => {
    if (!search) return
    setLoadingCities(true)
    try {
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NP_API_KEY,
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: {
            FindByString: search,
            Limit: 10
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        // Формуємо масив міст з API
        const citiesData = data.data.map(item => ({
          ref: item.Ref,
          name: item.Description
        }))
        setCities(citiesData)
      } else {
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити міста",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
      toast({
        title: "Помилка",
        description: "Сталася помилка при завантаженні міст",
        variant: "destructive"
      })
    } finally {
      setLoadingCities(false)
    }
  }
  
  // Branch search through Nova Poshta API
  const fetchBranches = async (cityRef, search = '') => {
    if (!cityRef) return
    setLoadingBranches(true)
    try {
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NP_API_KEY,
          modelName: 'AddressGeneral',
          calledMethod: 'getWarehouses',
          methodProperties: {
            CityRef: cityRef,
            FindByString: search,
            Limit: 10
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        const branchesData = data.data.map(item => ({
          ref: item.Ref,
          number: item.Number,
          address: item.ShortAddress
        }))
        setBranches(branchesData)
      } else {
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити відділення",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
      toast({
        title: "Помилка",
        description: "Сталася помилка при завантаженні відділень",
        variant: "destructive"
      })
    } finally {
      setLoadingBranches(false)
    }
  }
  
  // Branch search effect
  useEffect(() => {
    if (formData.city) {
      const selectedCity = cities.find(city => city.name === formData.city)
      if (selectedCity) {
        fetchBranches(selectedCity.ref, searchBranch)
      }
    }
  }, [searchBranch, formData.city, cities])

  // Empty cart check
  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Ваш кошик порожній</h1>
        <p className="mb-8 text-muted-foreground">Додайте товари до кошика перш ніж оформити замовлення.</p>
        <Button asChild>
          <Link href="/products">Продовжити покупки</Link>
        </Button>
      </div>
    )
  }

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleCitySearch = (value) => {
    setFormData(prev => ({ ...prev, city: value, branch: '' }))
    fetchCities(value)
  }
  
  const handleCitySelect = (city) => {
    setFormData(prev => ({ ...prev, city: city.name, branch: '' }))
    setSearchBranch('')
    fetchBranches(city.ref)
  }
  
  const handleBranchSearch = (value) => {
    setSearchBranch(value)
  }
  
  const handleBranchSelect = (branch) => {
    setFormData(prev => ({ 
      ...prev, 
      branch: `Відділення №${branch.number}: ${branch.address}` 
    }))
    setSearchBranch(null)
  }
  
  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }
  
  // Navigate to payment tab
  const handleGoToPayment = () => {
    if (validateShippingForm()) {
      setActiveTab("payment")
    }
  }

  // Submit order to database
// Submit order to database
const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validateShippingForm()) {
    return
  }
  
  setLoading(true)
  
  try {
    // Prepare data as a regular JSON object instead of FormData
    const orderData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      shipping_city: formData.city,
      shipping_address: formData.branch,
      payment_method: formData.paymentMethod,
      total_amount: totalPrice,
      status: 'pending',
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    // Submit order to API with JSON content type
    const response = await api.post('/orders/', orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 201) {
      // Order created successfully
      toast({
        title: 'Замовлення оформлено успішно!',
        description: `Номер замовлення: ${response.data.id}`,
      });
      
      // Store order ID in local storage for the success page
      localStorage.setItem('last_order_id', response.data.id);
      
      // Clear cart and redirect to success page
      clearCart();
      router.push('/order/success');
    }
  } catch (error) {
    console.error('Error placing order:', error);
    toast({
      title: 'Помилка при оформленні замовлення',
      description: error.response?.data?.error || 'Спробуйте знову пізніше',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header User={user} cart={cart} Search_Included={false} />
      
      <div className="container mx-auto py-8 px-4 md:px-6 flex-grow">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/cart" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-2" /> Назад до кошика
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-8">Оформлення замовлення</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="shipping" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Доставка
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className={cn(
                    "flex items-center gap-2",
                    !isShippingValid && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!isShippingValid}
                >
                  <CreditCard className="h-4 w-4" /> Оплата
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                {/* Shipping tab content */}
                <TabsContent value="shipping" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Інформація про доставку</CardTitle>
                      <CardDescription>Введіть ваші контактні дані та адресу доставки</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Ім'я*</Label>
                          <Input 
                            id="firstName" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Прізвище*</Label>
                          <Input 
                            id="lastName" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Електронна пошта*</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Номер телефону*</Label>
                          <Input 
                            id="phone" 
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+380"
                          />
                        </div>
                      </div>
                      
                      {/* Nova Poshta City Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="city">Місто*</Label>
                        <div className="relative">
                          <Input 
                            id="city" 
                            name="city"
                            value={formData.city}
                            onChange={(e) => handleCitySearch(e.target.value)}
                            required
                            placeholder="Почніть вводити назву міста"
                          />
                          {loadingCities && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        
                        {cities.length > 0 && formData.city && !cities.find(c => c.name === formData.city) && (
                          <div className="mt-1 border rounded-md shadow-sm">
                            <ScrollArea className="h-48">
                              {cities.map((city) => (
                                <div 
                                  key={city.ref}
                                  className="p-2 hover:bg-muted cursor-pointer"
                                  onClick={() => handleCitySelect(city)}
                                >
                                  {city.name}
                                </div>
                              ))}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                      
                      {/* Nova Poshta Branch Selection - only shown when city is selected */}
                      {formData.city && (
                        <div className="space-y-2">
                          <Label htmlFor="branch">Відділення Нової Пошти*</Label>
                          
                          {/* Показуємо вибране відділення, якщо воно вже вибране */}
                          {formData.branch && !searchBranch && (
                            <div className="mt-2 p-3 bg-muted rounded-md">
                              <div className="flex justify-between items-center">
                                <div>
                                  <Label>Вибране відділення:</Label>
                                  <p className="text-sm mt-1">{formData.branch}</p>
                                </div>
                                <Button 
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSearchBranch('')} // Встановлюємо порожній рядок, щоб відкрити пошук
                                  className="text-primary"
                                >
                                  Змінити
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Пошук відділення - показуємо лише якщо відділення ще не вибрано або користувач хоче змінити */}
                          {(!formData.branch || searchBranch !== null) && (
                            <div className="relative">
                              <Input 
                                id="searchBranch"
                                value={searchBranch}
                                onChange={(e) => handleBranchSearch(e.target.value)}
                                placeholder="Введіть номер або адресу відділення"
                                autoFocus={!!formData.branch} // Автофокус якщо змінюємо вже вибране відділення
                              />
                              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              {loadingBranches && (
                                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                  <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                                </div>
                              )}
                            </div>
                          )}

                            {/* Список відділень - показуємо тільки під час активного пошуку */}
                            {branches.length > 0 && (
                              // Показувати тільки якщо відділення ще не вибрано АБО користувач активно шукає нове
                              (!formData.branch || searchBranch !== null) && (
                                <div className="mt-1 border rounded-md shadow-sm">
                                  <ScrollArea className="h-48">
                                    {branches.map((branch) => (
                                      <div 
                                        key={branch.ref}
                                        className="p-2 hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                          handleBranchSelect(branch);
                                        }}
                                      >
                                        <span className="font-semibold">№{branch.number}</span>: {branch.address}
                                      </div>
                                    ))}
                                  </ScrollArea>
                                </div>
                              )
                            )}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                          id="saveInfo" 
                          checked={formData.saveInfo}
                          onCheckedChange={(checked) => handleCheckboxChange('saveInfo', checked)}
                        />
                        <Label htmlFor="saveInfo">Зберегти цю інформацію для наступних замовлень</Label>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="button" 
                        onClick={handleGoToPayment}
                      >
                        Перейти до оплати
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                {/* Payment tab content */}
                <TabsContent value="payment" className="space-y-6 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Спосіб оплати</CardTitle>
                      <CardDescription>Виберіть зручний спосіб оплати</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {/* Cash on Delivery option */}
                        <div 
                          className={`p-4 border rounded-md cursor-pointer ${formData.paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cash' ? 'border-primary' : 'border-muted-foreground'}`}>
                              {formData.paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <Label className="cursor-pointer">Накладений платіж</Label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 pl-6">Оплата при отриманні у відділенні Нової Пошти</p>
                        </div>
                        
                        {/* Online payment option */}
                        <div 
                          className={`p-4 border rounded-md cursor-pointer ${formData.paymentMethod === 'liqpay' ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'liqpay' }))}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'liqpay' ? 'border-primary' : 'border-muted-foreground'}`}>
                              {formData.paymentMethod === 'liqpay' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <Label className="cursor-pointer">LiqPay</Label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 pl-6">Оплата карткою онлайн через LiqPay</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                          <span className="flex items-center">
                            <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                            Обробка...
                          </span>
                        ) : (
                          `Оформити замовлення на суму ${totalPrice.toFixed(2)} грн`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </form>
            </Tabs>
          </div>
          
          {/* Right side - Order summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ваше замовлення</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 mb-4 pb-4 border-b border-border">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        {item.images && item.images[0] && (
                          <Image src={item.images[0].image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Кількість: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{(item.price * item.quantity).toFixed(2)} грн</p>
                    </div>
                  ))}
                </ScrollArea>
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сума замовлення</span>
                    <span>{totalPrice.toFixed(2)} грн</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span>За тарифами Нової Пошти</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t">
                    <span>Разом</span>
                    <span>{totalPrice.toFixed(2)} грн</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-sm">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                    <span>Безпечна оплата</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mt-2">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                    <span>Доставка Новою Поштою по всій Україні</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
