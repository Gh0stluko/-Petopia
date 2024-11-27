'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Camera } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Cropper from 'react-easy-crop'
import api from '@/app/services/api'
import Cookies from 'js-cookie'

export default function SocialLoginCompletion() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()

  const [cropperOpen, setCropperOpen] = useState(false)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect] = useState(1)
  const [imageSource, setImageSource] = useState(null)
  const [user, setUser] = useState({})
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  useEffect(() => {
    if (!Cookies.get('accessToken')) {
      router.push('/account/auth')
    } else {
      api.get('/user/me').then((res) => {
        setUser(res.data)
        if (res.data.registration_complete) {
          router.push('/')
        }
      }).catch(err => {
        console.error("Error fetching user data:", err)
        setError("Failed to load user data. Please try again.")
      })
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setPasswordError("")
  
    const formData = new FormData(e.target)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const username = formData.get('username')
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const gender = formData.get('gender')
    const dateOfBirth = formData.get('dateOfBirth')
  
    if (!password || !confirmPassword || !username) {
      setError("Password, confirm password, and username are required")
      return
    }
  
    // Updated password validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    const isLongEnough = password.length >= 8
  
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough)) {
      setPasswordError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
      return
    }
  
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
  
    if (croppedAreaPixels && imageSource) {
      try {
        const croppedImage = await getCroppedImg(imageSource, croppedAreaPixels)
        formData.append('avatar', croppedImage, 'avatar.jpg')
      } catch (error) {
        console.error("Error cropping image:", error)
        setError("Failed to process the avatar image. Please try again.")
        return
      }
    }
  
    try {
      const response = await api.post('/profile-complete/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
  
      if (response.status === 200) {
        // Update user data in state or context if necessary
        setUser(prevUser => ({
          ...prevUser,
          username,
          first_name: firstName,
          last_name: lastName,
          gender,
          date_birth: dateOfBirth,
          registration_complete: true
        }))
  
        // Redirect to home page or dashboard
        router.push('/')
      } else {
        setError("Unexpected response from server. Please try again.")
      }
    } catch (err) {
      console.error("Profile completion error:", err)
      setError(err.response?.data?.error || "Failed to complete profile. Please try again.")
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

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImg = (imageSrc, pixelCrop) => {
    const image = new Image()
    image.src = imageSrc
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg')
    })
  }

  const handleCropSave = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSource, croppedAreaPixels)
      const imageUrl = URL.createObjectURL(croppedImage)
      setImageSource(imageUrl)
      setCropperOpen(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={imageSource || user.avatar} alt="User Avatar" />
                    <AvatarFallback>
                      {user.username ? user.username.substring(0, 2).toUpperCase() : 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Upload avatar</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" placeholder="Choose a username" required defaultValue={user.username}/>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    defaultValue=''
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
              {passwordError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" type="text" placeholder="Enter your first name" defaultValue={user.first_name}/>
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" type="text" placeholder="Enter your last name" defaultValue={user.last_name}/>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" defaultValue={user.gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={user.date_birth} />
              </div>
              <Button type="submit" className="w-full">Complete Profile</Button>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

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
              onZoomChange={setZoom}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setCropperOpen(false)}>Cancel</Button>
            <Button onClick={handleCropSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

