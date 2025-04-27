import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'

export async function GET() {
  const client = new RedisClient()
  try {
    const pong = await client.ping()
    return NextResponse.json({ pong })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    client.quit()
  }
}
