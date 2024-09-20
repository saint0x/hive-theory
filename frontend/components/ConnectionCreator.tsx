'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentPicker from './DocumentPicker'

const ConnectionCreator: React.FC = () => {
  const [sheetId, setSheetId] = useState<string | null>(null)
  const [sheetName, setSheetName] = useState<string | null>(null)
  const [slideId, setSlideId] = useState<string | null>(null)
  const [slideName, setSlideName] = useState<string | null>(null)

  const handleCreateConnection = async () => {
    if (!sheetId || !slideId) {
      alert('Please select both a Google Sheet and a Google Slides document')
      return
    }

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId,
          slideId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create connection')
      }

      const data = await response.json()
      alert(`Connection created successfully! ID: ${data.id}`)
      // Reset selected documents
      setSheetId(null)
      setSheetName(null)
      setSlideId(null)
      setSlideName(null)
    } catch (error) {
      console.error('Error creating connection:', error)
      alert('Failed to create connection. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Google Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentPicker
              documentType="sheets"
              onSelect={(id, name) => {
                setSheetId(id)
                setSheetName(name)
              }}
            />
            {sheetName && <p className="mt-2">Selected: {sheetName}</p>}
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Google Slides</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentPicker
              documentType="slides"
              onSelect={(id, name) => {
                setSlideId(id)
                setSlideName(name)
              }}
            />
            {slideName && <p className="mt-2">Selected: {slideName}</p>}
          </CardContent>
        </Card>
      </div>
      <Button
        onClick={handleCreateConnection}
        disabled={!sheetId || !slideId}
      >
        Create Connection
      </Button>
    </div>
  )
}

export default ConnectionCreator