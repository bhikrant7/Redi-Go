import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'

export async function GET() {
  const client = new RedisClient()
  try {
    // Ping the Redis server to check if it's alive
    const pong = await client.ping()
    
    // Return successful response with pong value
    return NextResponse.json({ pong })
  } catch (err: any) {
    // Log error to server logs for debugging
    console.error('Redis error:', err)

    // Return a 500 error with error message
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  } finally {
    // Always ensure the Redis connection is closed
    try {
      client.quit()
    } catch (closeErr) {
      console.error('Error closing Redis connection:', closeErr)
    }
  }
}
