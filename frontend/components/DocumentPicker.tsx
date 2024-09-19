'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleAuthResult, GooglePickerResponse, GoogleUser } from '@/types/google'

interface SelectedDocument {
  id: string;
  name: string;
}

export default function DocumentPicker() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null)

  useEffect(() => {
    const loadGoogleApi = () => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = initializeGoogleAuth
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }

    loadGoogleApi()
  }, [])

  const initializeGoogleAuth = () => {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'https://www.googleapis.com/auth/drive.file'
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance()
        handleAuthChange(authInstance.isSignedIn.get())
        authInstance.isSignedIn.listen(handleAuthChange)
      }).catch((error: Error) => {
        console.error('Error initializing Google Auth:', error)
      })
    })
  }

  const handleAuthChange = (isSignedIn: boolean) => {
    setIsAuthenticated(isSignedIn)
    if (isSignedIn) {
      const googleUser = window.gapi.auth2.getAuthInstance().currentUser.get()
      setUser(googleUser)
    } else {
      setUser(null)
    }
  }

  const handleLogin = () => {
    window.gapi.auth2.getAuthInstance().signIn().then((googleUser: GoogleUser) => {
      setUser(googleUser)
      setIsAuthenticated(true)
    }).catch((error: Error) => {
      console.error('Error signing in:', error)
    })
  }

  const handleLogout = () => {
    window.gapi.auth2.getAuthInstance().signOut().then(() => {
      setUser(null)
      setIsAuthenticated(false)
      setSelectedDocument(null)
    }).catch((error: Error) => {
      console.error('Error signing out:', error)
    })
  }

  const loadPicker = () => {
    window.gapi.load('picker', () => {
      window.gapi.auth.authorize(
        {
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          scope: 'https://www.googleapis.com/auth/drive.file',
          immediate: false
        },
        handleAuthResult
      )
    })
  }

  const handleAuthResult = (authResult: GoogleAuthResult) => {
    if (authResult && !authResult.error) {
      createPicker(authResult.access_token)
    }
  }

  const createPicker = (oauthToken: string) => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.SPREADSHEETS)
      .addView(window.google.picker.ViewId.PRESENTATIONS)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY!)
      .setCallback(pickerCallback)
      .build()
    picker.setVisible(true)
  }

  const pickerCallback = (data: GooglePickerResponse) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const document = data.docs[0]
      setSelectedDocument({
        id: document.id,
        name: document.name
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Google Document Picker</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <Button onClick={handleLogin} className="w-full">
            Log in with Google
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p>Welcome, {user?.getBasicProfile().getName()}</p>
              <Button onClick={handleLogout} variant="outline">Log out</Button>
            </div>
            <Button onClick={loadPicker} className="w-full">
              Select a Document
            </Button>
            {selectedDocument && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-semibold">Selected Document:</h3>
                <p>{selectedDocument.name}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}