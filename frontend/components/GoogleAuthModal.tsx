'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const GoogleAuthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url')
      if (!response.ok) {
        throw new Error('Failed to fetch Google auth URL')
      }
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No URL returned from server')
      }
    } catch (error) {
      console.error('Error initiating Google login:', error)
      setError('Failed to initiate Google login. Please try again.')
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Connect Google Account</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect your Google Account</DialogTitle>
            <DialogDescription>
              Link your Google account to access your Sheets and Slides.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleGoogleLogin} className="w-full">
              Sign in with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GoogleAuthModal