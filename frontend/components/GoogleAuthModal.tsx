'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Image from 'next/image'

interface GoogleAuthModalProps {}

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    setError(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '')
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')
    const responseType = 'code'
    const accessType = 'offline'
    const prompt = 'consent'

    if (!clientId || !redirectUri) {
      setError('Missing Google OAuth configuration. Please check your environment variables.')
      return
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`

    window.location.href = authUrl
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
            <Image
              src="/google-logo.png"
              alt="Google Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
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