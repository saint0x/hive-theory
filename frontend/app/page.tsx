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
  const [currentPage, setCurrentPage] = useState<'welcome' | 'create' | 'list'>('welcome')

  useEffect(() => {
    const checkAuthStatus = async () => {
      const sessionToken = localStorage.getItem('sessionToken')
      if (sessionToken) {
        try {
          // Decode the session token (in a real app, you'd verify the token's signature)
          const tokenData = JSON.parse(atob(sessionToken))
          
          if (tokenData.exp * 1000 > Date.now()) {
            // Token is still valid
            setIsAuthenticated(true)
            setUser({
              id: tokenData.userId,
              name: tokenData.name || '',
              email: tokenData.email,
              imageUrl: '' // You might want to store this in the token or fetch it separately
            })
            setCurrentPage('create')
          } else {
            // Token has expired, try to refresh
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId: tokenData.userId }),
            })
            
            if (refreshResponse.ok) {
              const { token } = await refreshResponse.json()
              localStorage.setItem('sessionToken', token)
              setIsAuthenticated(true)
              setCurrentPage('create')
              // You might want to update user info here
            } else {
              // Refresh failed, clear the token
              localStorage.removeItem('sessionToken')
              setIsAuthenticated(false)
              setUser(null)
              setCurrentPage('welcome')
            }
          }
        } catch (error) {
          console.error('Error checking auth status:', error)
          localStorage.removeItem('sessionToken')
          setIsAuthenticated(false)
          setUser(null)
          setCurrentPage('welcome')
        }
      }
    }

    checkAuthStatus()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    setUser(null)
    setIsAuthenticated(false)
    setCurrentPage('welcome')
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="mb-4 text-lg">Welcome to Hive Theory</p>
            <GoogleAuthModal onSuccess={() => setCurrentPage('create')} />
          </div>
        )
      case 'create':
        return <ConnectionCreator />
      case 'list':
        return <ConnectionList />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Hive Theory</h1>
      {isAuthenticated && (
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p>Welcome, {user?.name}</p>
            <p>{user?.email}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => setCurrentPage('create')}>Create Connection</Button>
            <Button onClick={() => setCurrentPage('list')}>View Connections</Button>
            <Button onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  )
}