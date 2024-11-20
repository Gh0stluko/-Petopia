'use client'

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import Cropper from 'react-easy-crop'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, UserCircle, Camera } from 'lucide-react'
import Snowfall from 'react-snowfall'
import api from '@/app/services/api'
import { Skeleton } from "@/components/ui/skeleton"
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export function AccountPageJsx() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatar, setAvatar] = useState('/default-avatar.jpg')
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [country, setCountry] = useState('US')
  const router = useRouter()

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

    setIsLoading(true)
    api.get('/user/me').then((res) => {
      setUser(res.data)
      setCountry(res.data.country || 'US')
      setIsLoading(false)
    })
  }, [])

  // Mock order history
  const orders = []

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedUser = {
      first_name: e.target.name?.value,
      last_name: e.target.surname?.value,
      address: e.target.address?.value,
      date_birth: e.target.dateOfBirth?.value,
      phone: e.target.phone?.value,
      gender: e.target.gender?.value,
    };
    
    console.log(updatedUser);
    try {
      const response = await api.put('/user/update_me/', updatedUser);
      setUser({ ...user, ...updatedUser });
    } catch (error) {
      console.error('Error updating user information:', error);
      alert('Failed to update user information');
    }
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('username');
    window.location.href = '/';
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedImage(croppedAreaPixels)
  }, [])

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
        } catch (error) {
          console.error('Error updating avatar:', error)
          alert('Failed to update avatar')
        }
      }
    }
  }

  return (
    (<div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="w-16 h-16 rounded-full relative">
            <Image
              src="/logo.svg"
              alt="Petopia"
              fill
              priority
              style={{ objectFit: 'contain' }} />
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <div className="relative">
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User menu</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    router.push('/account/auth');
                  }}>
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">Login</span>
                </Button>
              )}
              
              {isMenuOpen && user && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <a
                    href={`/account/${user.username}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
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
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full" />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer">
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" />
              </div>
              <div>
                {user.first_name && user.last_name ? (
                  <h2 className="text-2xl font-semibold">{user.first_name} {user.last_name}</h2>
                ) : null}
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            <Tabs defaultValue="info" className="space-y-4">
              <TabsList>
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="settings">Account Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          defaultValue={user.username}
                          readOnly
                          style={{ backgroundColor: '#f0f0f0', color: '#333', borderColor: '#ccc' }} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user.email}
                          readOnly
                          style={{ backgroundColor: '#f0f0f0', color: '#333', borderColor: '#ccc' }} />
                      </div>
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={user.first_name} />
                      </div>
                      <div>
                        <Label htmlFor="surname">Surname</Label>
                        <Input id="surname" defaultValue={user.last_name} />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" defaultValue={user.address} />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" type="date" defaultValue={user.date_birth} />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="flex">
                          <PhoneInput
                            country={'ua'}
                            value={user.phone}
                            inputProps={{
                              name: 'phone',
                              required: true,
                              autoFocus: true
                            }}
                            containerStyle={{ width: '100%' }}
                            inputStyle={{ width: '100%' }} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          defaultValue={user.gender}
                          className="w-full p-2 border rounded">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <Button type="submit">Update Information</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="flex justify-between items-center p-4">
                            <div>
                              <p className="font-semibold">{order.id}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">{order.status}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="password" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="password">Change Password</TabsTrigger>
                        <TabsTrigger value="delete">Delete Account</TabsTrigger>
                      </TabsList>
                      <TabsContent value="password">
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          <Button type="submit">Change Password</Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="delete">
                        <div className="space-y-4">
                          <p className="text-red-600">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
                          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                            <div>
                              <Label htmlFor="confirm-username">Type your username to confirm</Label>
                              <Input id="confirm-username" placeholder={user.username} />
                            </div>
                            <Button variant="destructive" type="submit">Delete Account</Button>
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
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>
          <div className="h-[300px] relative">
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom} />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCropperOpen(false)}>Cancel</Button>
            <Button onClick={handleCropSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Snowfall />
    </div>)
  );
}