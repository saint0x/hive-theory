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
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentPage, setCurrentPage] = useState<'welcome' | 'create' | 'list'>('welcome')

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include' // This is important to include cookies
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
        setIsAuthenticated(false);
        setUser(null);
        setCurrentPage('welcome');
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
      setCurrentPage('welcome');
    } catch (error) {
      console.error('Error logging out:', error);
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
      {isAuthenticated && user && (
        <div className="mb-8 flex justify-between items-center">
          <div>
            <p>Welcome, {user.name}</p>
            <p>{user.email}</p>
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