import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'

const MOVIES_API = 'https://jsonfakery.com/movies/paginated?page=1'

export async function GET() {
    console.log('GET');
  const client = new RedisClient()
  try {
    console.log('GET: /api/movies/cache');
    const cacheKey = 'movies:page:1'
    // 1️⃣ Try cache
    const cached = await client.get(cacheKey)
    if (cached) {
      console.log('cache hit');
      console.log('cached: ', cached);
      return NextResponse.json({ source: 'cache', data: JSON.parse(cached) })
    }

    // 2️⃣ Cache miss → fetch remote
    const start = Date.now()
    const r = await fetch(MOVIES_API)
    const data = await r.json()
    const duration = Date.now() - start

    // 3️⃣ Store in Redis (no TTL support yet)
    const resp = await client.set(cacheKey, JSON.stringify(data))
    console.log('response of cache set: ', resp);
    return NextResponse.json({ source: 'api', duration, data })
  } catch (err: any) {
    console.error('error: ', err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    console.log('quitting client');
    client.quit()
  }
}
