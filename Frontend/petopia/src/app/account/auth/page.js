'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from 'lucide-react'
import { FaGoogle as Google } from 'react-icons/fa'
import Snowfall from 'react-snowfall'
import { login, register } from '@/app/services/auth'
import Cookies from 'js-cookie'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleLogin } from '@react-oauth/google'
import { jwt_decode } from 'jwt-decode'
import api from '@/app/services/api'
export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const router = useRouter()

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleLogin = async (response) => {
    const googleToken = response.credential;
    try {
      const res = await api.post('/auth/google/', {
        google_token: googleToken
      });

      if (res.status === 200) {
        const { access, refresh, name } = res.data;

        Cookies.set('accessToken', access);
        Cookies.set('refreshToken', refresh);
        Cookies.set('username', name);
        // Redirect to a protected page
        api.get('/user/me').then((res) => {
          setUser(res.data)
          if (res.data.registration_complete) {
            router.push('/')
          }
          else {
            router.push('/auth/verification')
          }
        }).catch(err => {
          console.error("Error fetching user data:", err)
          setError("Failed to load user data. Please try again.")
        })
        
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const email = e.target.email?.value
    const password = e.target.password?.value

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    const username = e.target.username?.value
    const email = e.target.email?.value
    const password = e.target.password?.value
    const confirmPassword = e.target['confirm-password']?.value

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await register(username, email, password)
      // Automatically log in after successful registration
      await login(email, password)
      router.push('auth/verification')
    } catch (err) {
      setError("Registration failed. Please try again.")
    }
  }

  const onGoogleLoginError = () => {
    setError("Google login failed. Please try again.")
  }

  useEffect(() => {
    const accessToken = Cookies.get('accessToken')
    if (accessToken) {
      router.push('/')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
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
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Login</Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input id="register-username" name="username" type="text" placeholder="Enter your username" required />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Register</Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleLogin}
              onError={onGoogleLoginError}
              useOneTap
              render={(renderProps) => (
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <Google className="mr-2 h-4 w-4" />
                  Login with Google
                </Button>
              )}
            />
            </div>
          </CardContent>
        </Card>
      </main>

      <Snowfall />
    </div>
  )
}