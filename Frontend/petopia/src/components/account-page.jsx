'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import api from '@/app/services/api'
import Cookies from 'js-cookie'

// ... (previous imports and component code)

export default function AccountPage() {
  // ... (previous state and functions)

  const [passwordError, setPasswordError] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const HandleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

    const currentPassword = e.target['current-password'].value
    const newPassword = e.target['new-password'].value
    const confirmPassword = e.target['confirm-password'].value

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long')
      return
    }

    try {
      const response = await api.post('/user/change_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      })

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Your password has been successfully changed.",
        })

        // Clear the form
        e.target.reset()

        // Log out the user
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Cookies.remove('username')
        router.push('/account/auth')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.response && error.response.data && error.response.data.detail) {
        setPasswordError(error.response.data.detail)
      } else {
        setPasswordError('An error occurred while changing the password')
      }
    }
  }

  // ... (rest of the component code)

  return (
    // ... (previous JSX)
    // ... (rest of the JSX)
    (<TabsContent value="password">
      <form onSubmit={HandleChangePassword} className="space-y-4">
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
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
        <Button type="submit">Change Password</Button>
      </form>
    </TabsContent>)
  );
}

