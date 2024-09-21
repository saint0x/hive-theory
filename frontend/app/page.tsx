'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import ConnectionCreator from '@/components/ConnectionCreator'
import ConnectionList from '@/components/ConnectionList'
import GoogleAuthModal from '@/components/GoogleAuthModal'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function Component() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentPage, setCurrentPage] = useState<'welcome' | 'create' | 'list'>('welcome')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
          setCurrentPage('create');
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setCurrentPage('welcome');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setError('Failed to check authentication status. Please try again.');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('welcome');
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentPage('welcome');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out. Please try again.');
    }
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
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isAuthenticated && user && (
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <p className="font-semibold">Welcome, {user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div className="space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
            <Button onClick={() => setCurrentPage('create')}>Create Connection</Button>
            <Button onClick={() => setCurrentPage('list')}>View Connections</Button>
            <Button onClick={handleLogout} variant="outline">Log out</Button>
          </div>
        </div>
      )}
      {renderContent()}
    </div>
  )
}