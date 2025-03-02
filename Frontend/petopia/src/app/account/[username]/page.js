'use client'

import { useState, useRef, useCallback, useEffect, act } from 'react'
import Link from 'next/link'
import Cropper from 'react-easy-crop'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ShoppingCart, UserCircle, Camera, Package, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Snowfall from 'react-snowfall'
import api from '@/app/services/api'
import { Skeleton } from "@/components/ui/skeleton"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/nav'
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'

export default function AccountPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [country, setCountry] = useState('US')
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [passwordError, setPasswordError] = useState('')
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState({})

  const [cropperOpen, setCropperOpen] = useState(false)
  const [croppedImage, setCroppedImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect] = useState(1)
  const [imageSource, setImageSource] = useState(null)

  useEffect(() => {
    if (!Cookies.get('accessToken')) {
      router.push('/account/auth')
    }

    api.get('/user/me').then((res) => {
      setUser(res.data)
      if (res.data.registration_complete === true) {
        setIsLoading(false)
        
        // Fetch user's orders after getting user data
        fetchOrders()
      } else {
        router.push('/account/auth/verification')
      }
    }).catch((error) => {
      console.error('Error fetching user data:', error)
      setIsLoading(false)
    })
  }, [router])
  
// Fetch user's order history
const fetchOrders = async () => {
  setOrdersLoading(true)
  try {
    // Use the correct path without the 'api' prefix since it's likely already in the base URL
    const response = await api.get('get-orders/');
    setOrders(response.data);
    console.log('Orders:', response.data);
  } catch (error) {
    console.error('Помилка завантаження замовлень:', error);
    toast({
      variant: "destructive",
      title: "Помилка",
      description: "Не вдалося завантажити історію замовлень",
    });
  } finally {
    setOrdersLoading(false);
  }
};

  // Helper function to get order status badge styling
  const getStatusBadgeVariant = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Format date to local format
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedUser = {
      first_name: e.target.name?.value,
      last_name: e.target.surname?.value,
      address: e.target.address?.value,
      date_birth: e.target.dateOfBirth?.value,
      phone: e.target.phone?.value,
      gender: e.target.gender?.value,
    }
    
    try {
      const response = await api.put('/user/update_me/', updatedUser)
      setUser(response.data)
      toast({
        title: "Успіх",
        description: "Ваші дані успішно оновлено",
      })
    } catch (error) {
      console.error('Помилка оновлення інформації користувача:', error)
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося оновити інформацію користувача",
      })
    }
  }

  const handleLogout = () => {
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    Cookies.remove('username')
    window.location.href = '/'
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedImage(croppedAreaPixels)
  }, [])
  const HandleAccountDelete = async (e) => {
    e.preventDefault()
    const confirmUsername = e.target['confirm-username'].value
  
    if (confirmUsername !== user.username) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Ім'я користувача не співпадає",
      })
      return
    
    }
    try
    {
      const response = await api.post('/delete-account/')
      toast({
        variant: "success",
        title: "Успіх",
        description: "Ваш обліковий запис було успішно видалено.",
        action: ToastAction.Success,
      })
      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      Cookies.remove('username')
      await new Promise(resolve => setTimeout(resolve, 1500))
      router.push('/')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Під час видалення облікового запису сталася помилка",
        action: ToastAction.Error,
      })
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSource(reader.result)
        setCropperOpen(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const HandleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    const currentPassword = e.target['current-password'].value
    const newPassword = e.target['new-password'].value
    const confirmPassword = e.target['confirm-password'].value

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Всі поля обов\'язкові до заповнення')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новий пароль та підтвердження не співпадають')
      return
    }

    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const isLongEnough = newPassword.length >= 8
  
    if (!(hasUpperCase && hasLowerCase && hasNumbers && isLongEnough)) {
      setPasswordError("Пароль повинен бути не менше 8 символів і містити принаймні одну велику літеру, одну малу літеру та одну цифру.")
      return
    }

    try {
      const response = await api.post('/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
      })

      if (response.status === 200) {
        toast({
          title: "Успіх",
          description: "Ваш пароль успішно змінено.",
          action: ToastAction.success,
        })
        // Clear the form
        e.target.reset()

        // Log out the user
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('username')
        await new Promise(resolve => setTimeout(resolve, 3000))
      

        router.push('/account/auth')
      }
    } catch (error) {
      console.error('Помилка зміни паролю:', error)
      if (error.response && error.response.status === 400) {
        setPasswordError('Поточний пароль невірний')
      } else
      if (error.response && error.response.data && error.response.data.detail) {
        setPasswordError(error.response.data.detail)
      } else {
        setPasswordError('Під час зміни паролю сталася помилка')
      }
    }
  }

  const handleCropSave = async () => {
    if (croppedImage) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const image = new Image()
      image.src = imageSource
      image.onload = async () => {
        canvas.width = croppedImage.width
        canvas.height = croppedImage.height
        ctx.drawImage(
          image,
          croppedImage.x,
          croppedImage.y,
          croppedImage.width,
          croppedImage.height,
          0,
          0,
          croppedImage.width,
          croppedImage.height
        )
        const croppedImageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))
        const formData = new FormData()
        formData.append('avatar', croppedImageBlob, 'avatar.jpg')
        
        try {
          const response = await api.put('/user/update_avatar/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          setUser({ ...user, avatar: response.data.avatar })
          setCropperOpen(false)
          toast({
            title: "Успіх",
            description: "Фото профілю успішно оновлено",
          })
        } catch (error) {
          console.error('Помилка оновлення аватара:', error)
          toast({
            variant: "destructive",
            title: "Помилка",
            description: "Не вдалося оновити фото профілю",
          })
        }
      }
    }
  }
  const getCartFromLocalStorage = () => {
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  }
  useEffect(() => {
    const cart = getCartFromLocalStorage()
    setCart(cart)
  }, [])

  // View order details
  const viewOrderDetails = (orderId) => {
    router.push(`/order/${orderId}`)
  }

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  return (
    <div className=" bg-gray-100 flex flex-col">
      <Header User = {user} cart = {getCartFromLocalStorage} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Мій обліковий запис</h1>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar} alt="Аватар користувача" />
                  <AvatarFallback>
                  {user.username ? `${user?.username[0]}${user?.username[1]}` : '??'}
                </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer">
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div>
                {user.first_name  ? (
                  <h2 className="text-2xl font-semibold">{user.first_name} {user.last_name}</h2>
                ) : null}
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList>
                <TabsTrigger value="info">Особиста інформація</TabsTrigger>
                <TabsTrigger value="orders">Історія замовлень</TabsTrigger>
                <TabsTrigger value="settings">Налаштування</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Особиста інформація</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Ім'я користувача</Label>
                        <Input id="username" defaultValue={user.username} readOnly
                          style={{ backgroundColor: '#f0f0f0', color: '#333', borderColor: '#ccc' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Електронна пошта</Label>
                        <Input id="email" type="email" defaultValue={user.email} readOnly 
                          style={{ backgroundColor: '#f0f0f0', color: '#333', borderColor: '#ccc' }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Ім'я</Label>
                        <Input id="name" defaultValue={user.first_name} />
                      </div>
                      <div>
                        <Label htmlFor="surname">Прізвище</Label>
                        <Input id="surname" defaultValue={user.last_name} />
                      </div>
                      <div>
                        <Label htmlFor="address">Адреса</Label>
                        <Input id="address" defaultValue={user.address} />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Дата народження</Label>
                        <Input id="dateOfBirth" type="date" defaultValue={user.date_birth} />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Телефон</Label>
                        <div className="flex">
                          <PhoneInput
                            country={'ua'}
                            value={user.phone}
                            inputProps={{
                              name: 'phone',
                              required: true,
                            }}
                            containerStyle={{ width: '100%' }}
                            inputStyle={{ width: '100%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="gender">Стать</Label>
                        <select id="gender" defaultValue={user.gender} className="w-full p-2 border rounded">
                          <option value="Male">Чоловіча</option>
                          <option value="Female">Жіноча</option>
                          <option value="Other">Інше</option>
                          <option value="Prefer not to say">Не бажаю вказувати</option>
                        </select>
                      </div>
                      <Button type="submit">Оновити інформацію</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Історія замовлень</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-10">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700">Ще немає замовлень</h3>
                        <p className="text-gray-500 mt-2">Коли ви зробите замовлення, вони з'являться тут</p>
                        <Button className="mt-6" onClick={() => router.push('/')}>Почати покупки</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="overflow-hidden">
                            <div 
                              className="border-b px-6 py-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                              onClick={() => toggleOrderExpansion(order.id)}
                            >
                              <div>
                                <div className="flex items-center">
                                  <span className="font-semibold text-lg">Замовлення #{order.id}</span>
                                  <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeVariant(order.status)}`}>
                                    {order.status === 'pending' ? 'Очікує обробки' : 
                                     order.status === 'processing' ? 'В обробці' :
                                     order.status === 'shipped' ? 'Відправлено' :
                                     order.status === 'delivered' ? 'Доставлено' :
                                     order.status === 'cancelled' ? 'Скасовано' : order.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="flex items-center">
                                <div className="text-right mr-4">
                                  <p className="font-bold text-lg">{Number(order.total_amount).toFixed(2)} грн</p>
                                  <p className="text-sm text-gray-500">{order.payment_method === 'cash' ? 'Накладений платіж' : 'Онлайн оплата'}</p>
                                </div>
                                {expandedOrders[order.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </div>
                            </div>
                            <CardContent className={`py-4 ${expandedOrders[order.id] ? 'block' : 'hidden'}`}>
                              <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Інформація про доставку</h4>
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p><span className="font-medium">Адреса:</span> {order.shipping_city}, {order.shipping_address}</p>
                                      {order.shipping_phone && <p><span className="font-medium">Телефон:</span> {order.shipping_phone}</p>}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Деталі замовлення</h4>
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p><span className="font-medium">Статус:</span> {
                                        order.status === 'pending' ? 'Очікує обробки' : 
                                        order.status === 'processing' ? 'В обробці' :
                                        order.status === 'shipped' ? 'Відправлено' :
                                        order.status === 'delivered' ? 'Доставлено' :
                                        order.status === 'cancelled' ? 'Скасовано' : order.status
                                      }</p>
                                      <p><span className="font-medium">Оплата:</span> {order.payment_method === 'cash' ? 'Накладений платіж' : 'Онлайн оплата'}</p>
                                      <p><span className="font-medium">Дата:</span> {formatDate(order.created_at)}</p>
                                      {order.tracking_number && <p><span className="font-medium">Код відстеження:</span> {order.tracking_number}</p>}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3">Товари</h4>
                                  <div className="space-y-4">
                                    {order.items?.map((item, index) => (
                                      <div key={index} className="flex items-center border-b pb-3">
                                        <div className="w-16 h-16 mr-4 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                          {item.image ? (
                                            <div className="h-full w-full relative">
                                                <Image 
                                                src={
                                                  item.image 
                                                    ? item.image.startsWith('/') 
                                                      // If it's a relative URL, convert to absolute URL with domain
                                                      ? `http://${window.location.hostname}:8000${item.image}`
                                                      // Use as is if it's already absolute
                                                      : item.image
                                                    : ''
                                                }
                                                alt={item.product_name || "Товар"}
                                                fill
                                                sizes="64px"
                                                style={{ objectFit: 'cover' }}
                                                className="rounded"
                                              />
                                            </div>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                              <Package className="h-8 w-8 text-gray-400" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-grow">
                                          <div className="flex justify-between">
                                            <h5 
                                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                                              onClick={(e) => {
                                                e.stopPropagation(); // Запобігає спрацьовуванню toggleOrderExpansion
                                                router.push(`/product/${item.product_id}`);
                                              }}
                                            >
                                              {item.product_name || `Товар #${item.product_id}`}
                                            </h5>
                                            <span className="font-medium">{(Number(item.price) * Number(item.quantity)).toFixed(2)} грн</span>
                                          </div>
                                          <div className="flex justify-between mt-1">
                                            <p className="text-sm text-gray-500">
                                              Кількість: {item.quantity} × {Number(item.price).toFixed(2)} грн
                                            </p>
                                            {item.variant_info && <p className="text-sm text-gray-500">{item.variant_info}</p>}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-4 flex justify-between border-t pt-3">
                                    <span className="font-medium">Всього:</span>
                                    <span className="font-bold text-lg">{Number(order.total_amount).toFixed(2)} грн</span>
                                  </div>
                                </div>
                                
                                {order.notes && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Примітки</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Налаштування облікового запису</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="password" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="password">Змінити пароль</TabsTrigger>
                        <TabsTrigger value="delete">Видалити обліковий запис</TabsTrigger>
                      </TabsList>
                      <TabsContent value="password">
                      <form onSubmit={HandleChangePassword} className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Поточний пароль</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">Новий пароль</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Підтвердіть новий пароль</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        {passwordError && (
                          <p className="text-red-500 text-sm">{passwordError}</p>
                        )}
                        <Button type="submit">Змінити пароль</Button>
                      </form>
                      </TabsContent>
                      <TabsContent value="delete">
                        <div className="space-y-4">
                          <p className="text-red-600">Увага: Цю дію неможливо скасувати. Всі ваші дані будуть безповоротно видалені.</p>
                          <form onSubmit={HandleAccountDelete} className="space-y-4">
                            <div>
                              <Label htmlFor="confirm-username">Введіть ім'я користувача для підтвердження</Label>
                              <Input id="confirm-username" placeholder={user.username} />
                            </div>
                            <Button variant="destructive" type="submit">Видалити обліковий запис</Button>
                          </form>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Обрізати аватар</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] relative">
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCropperOpen(false)}>Скасувати</Button>
            <Button onClick={handleCropSave}>Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}