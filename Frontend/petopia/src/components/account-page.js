'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ShoppingCart, UserCircle, Camera } from 'lucide-react';
import Snowfall from 'react-snowfall'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export function AccountPageJs() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatar, setAvatar] = useState('/default-avatar.jpg')
  const [crop, setCrop] = useState({ aspect: 1 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  // Mock user data
  const user = {
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    address: "123 Pet Street, Animalville, PA 12345",
    dateOfBirth: "1990-01-01",
    phoneNumber: "+1 (555) 123-4567",
    gender: "Male"
  }

  // Mock order history
  const orders = [
    { id: "ORD001", date: "2023-05-15", total: 79.99, status: "Delivered" },
    { id: "ORD002", date: "2023-06-02", total: 124.50, status: "Shipped" },
    { id: "ORD003", date: "2023-06-20", total: 54.75, status: "Processing" },
  ]

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setAvatar(reader.result.toString() || '')
        setIsCropping(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onImageLoaded = (image) => {
    imgRef.current = image
  }

  const onCropComplete = (crop) => {
    setCompletedCrop(crop)
    makeClientCrop(crop)
  }

  const makeClientCrop = async (crop) => {
    if (imgRef.current && crop.width && crop.height) {
      createCropPreview(imgRef.current, crop, 'avatar.png')
    }
  }

  const createCropPreview = (image, crop, fileName) => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty')
          return
        }
        blob.name = fileName
        window.URL.revokeObjectURL(previewCanvasRef.current)
        previewCanvasRef.current = window.URL.createObjectURL(blob)
        resolve(previewCanvasRef.current)
      }, 'image/png')
    });
  }

  const handleCropSave = () => {
    if (previewCanvasRef.current) {
      setAvatar(previewCanvasRef.current)
      setIsCropping(false)
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-haspopup="true">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">User menu</span>
              </Button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        <div className="mb-8 flex items-center space-x-4">
          <div className="relative">
            <Image
              src={avatar}
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
              onChange={onSelectFile}
              className="hidden" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>
        {isCropping && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
              <ReactCrop
                src={avatar}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onImageLoaded={onImageLoaded}
                onComplete={onCropComplete} />
              <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={() => setIsCropping(false)}>Cancel</Button>
                <Button onClick={handleCropSave}>Save</Button>
              </div>
            </div>
          </div>
        )}
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
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue={user.address} />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" defaultValue={user.dateOfBirth} />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" type="tel" defaultValue={user.phoneNumber} />
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
      </main>
      <footer className="bg-white py-4 text-center text-sm text-gray-500">
        <p>&copy; 2023 Petopia. All rights reserved.</p>
      </footer>
      <Snowfall />
    </div>)
  );
}