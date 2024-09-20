'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const GoogleAuthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
        handleSignInSuccess(event.data.code);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const data = await response.json();
      if (data.url) {
        window.open(data.url, 'Google Sign-In', 'width=500,height=600');
      }
    } catch (error) {
      console.error('Failed to get Google Auth URL:', error);
    }
  }

  const handleSignInSuccess = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('sessionToken', data.token);
        setIsOpen(false);
        window.location.reload(); // Reload the page to update auth state
      }
    } catch (error) {
      console.error('Failed to complete Google Sign-In:', error);
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