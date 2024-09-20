'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import ConnectionCreator from '@/components/ConnectionCreator'
import ConnectionList from '@/components/ConnectionList'
import GoogleAuthModal from '@/components/GoogleAuthModal'

interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    console.log('Home component mounted')
    console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
    console.log('NEXT_PUBLIC_GOOGLE_REDIRECT_URI:', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI)

    const checkAuthStatus = async () => {
      console.log('Checking auth status')
      const token = localStorage.getItem('googleToken')
      if (token) {
        console.log('Token found in localStorage')
        try {
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          if (response.ok) {
            console.log('User info fetched successfully')
            const data = await response.json()
            setUser({
              id: data.sub,
              name: data.name,
              email: data.email,
              imageUrl: data.picture
            })
            setIsAuthenticated(true)
          } else {
            console.log('Token is invalid or expired')
            localStorage.removeItem('googleToken')
          }
        } catch (error) {
          console.error('Error checking auth status:', error)
        }
      } else {
        console.log('No token found in localStorage')
      }
    }

    checkAuthStatus()
  }, [])

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Handling auth callback')
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        console.log('Code found in URL params')
        try {
          // Exchange code for token (this should be done on your backend)
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
          })
          if (response.ok) {
            console.log('Code exchanged for token successfully')
            const { access_token } = await response.json()
            localStorage.setItem('googleToken', access_token)
            window.location.href = '/' // Redirect to remove the code from URL
          } else {
            console.error('Error exchanging code for token')
          }
        } catch (error) {
          console.error('Error handling auth callback:', error)
        }
      } else {
        console.log('No code found in URL params')
      }
    }

    handleAuthCallback()
  }, [])

  const handleLogout = () => {
    console.log('Logging out')
    localStorage.removeItem('googleToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hive Theory</h1>
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="mb-4 text-lg">Welcome to Hive Theory</p>
          <GoogleAuthModal />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <p>Welcome, {user?.name}</p>
              <p>{user?.email}</p>
            </div>
            <Button onClick={handleLogout}>Log out</Button>
          </div>
          <ConnectionCreator />
          <ConnectionList />
        </div>
      )}
    </div>
  )
}