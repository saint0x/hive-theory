'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getAuthUrl } from '@/lib/google-auth'

interface GoogleAuthModalProps {
  onSuccess: () => void;
}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    try {
      const authUrl = getAuthUrl()
      window.location.href = authUrl
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