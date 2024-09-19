import { auth } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ isConnected: false })
    }

    const googleAccount = user.externalAccounts.find(account => account.provider === 'google')
    return NextResponse.json({ isConnected: !!googleAccount })
  } catch (error) {
    console.error('Error checking Google connection:', error)
    return NextResponse.json({ isConnected: false, error: 'Failed to check connection' }, { status: 500 })
  }
}