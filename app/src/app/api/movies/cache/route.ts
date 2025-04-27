import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'
import connectMongo from '@/lib/mongodb';
import Movie from '@/models/Movie'; // Import the Movie model

const MOVIES_API = 'https://jsonfakery.com/movies/paginated?page=1'

export async function GET() {
    console.log('GET');
  const client = new RedisClient()
  try {
    const start = Date.now();
    console.log('GET: /api/movies/cache');
    const cacheKey = 'movies:page:1'
    // 1️⃣ Try cache
    const cached = await client.get(cacheKey)
    if (cached) {
      console.log('cache hit');
      console.log('cached: ', cached);
      return NextResponse.json({ source: 'cache', data: JSON.parse(cached) })
    }

    // 2️⃣ Cache miss → fetch from MongoDB
    await connectMongo(); // Connect to MongoDB

    const movies = await Movie.find(); // Fetch all movies from MongoDB

    if (!movies || movies.length === 0) {
      throw new Error('No movies found in the database');
    }

    const duration = Date.now() - start;
    console.log('Movies fetched from MongoDB:', movies);
    
    // 3️⃣ Store in Redis (no TTL support yet)
    const resp = await client.set(cacheKey, JSON.stringify(movies));
    console.log('response of cache set: ', resp);

    return NextResponse.json({ source: 'api', duration, data: movies })
  } catch (err: any) {
    console.error('error: ', err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    console.log('quitting client');
    client.quit()
  }
}
