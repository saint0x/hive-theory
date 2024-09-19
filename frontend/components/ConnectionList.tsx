'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Connection {
  id: string
  sheetId: string
  sheetName: string
  slideId: string
  slideName: string
  createdAt: string
}

const ConnectionList: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections')
        if (!response.ok) {
          throw new Error('Failed to fetch connections')
        }
        const data = await response.json()
        setConnections(data)
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    fetchConnections()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Connections</h2>
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <CardTitle>Connection {connection.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sheet: {connection.sheetName}</p>
            <p>Slides: {connection.slideName}</p>
            <p>Created: {new Date(connection.createdAt).toLocaleString()}</p>
            <Button className="mt-2">View Details</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ConnectionList