'use client'

import React from 'react'
import ConnectionCreator from '@/components/ConnectionCreator'
import { useRouter } from 'next/navigation'

export default function CreateConnectionPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Create Connection</h1>
      <ConnectionCreator onConnectionCreated={() => router.push('/')} />
    </div>
  )
}