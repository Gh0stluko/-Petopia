'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from 'lucide-react'
import Snowfall from 'react-snowfall'

export function AuthPageJs() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    (<div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="w-16 h-16 rounded-full relative">
            <Image
              src="/logo.svg"
              alt="Petopia"
              fill
              priority
              style={{ objectFit: 'contain' }} />
          </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password" />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" type="email" placeholder="Enter your email" />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password" />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" placeholder="Confirm your password" />
                    </div>
                    <Button type="submit" className="w-full">Register</Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-white py-4 text-center text-sm text-gray-500">
        <p>&copy; 2023 Petopia. All rights reserved.</p>
      </footer>
      <Snowfall />
    </div>)
  );
}