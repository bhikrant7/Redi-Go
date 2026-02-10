import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'
import connectMongo from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = url.searchParams.get('q') || ''
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit
  const cacheKey = `movies:search:${query}:${page}`
  const ttl = 300 // 5 minutes TTL

  const client = new RedisClient()

  try {
    const start = Date.now()
    console.log(`GET: /api/movies/search?q=${query}&page=${page}`)

    // Try Redis cache
    const cached = await client.get(cacheKey)
    if (cached) {
      console.log(' Cache HIT')
      const duration = Date.now() - start
      return NextResponse.json({ source: 'cache', duration, data: JSON.parse(cached) })
    }

    console.log(' Cache MISS')

    // Fetch from MongoDB using regex search
    await connectMongo()
    const movies = await Movie.find({
      original_title: { $regex: query, $options: 'i' }
    })
    .skip(skip)
    .limit(limit)
    .lean()

    if (!movies || movies.length === 0) {
      throw new Error('No movies found matching the search query')
    }

    // Extract only required fields
    const extractedMovies = movies.map(movie => ({
      movie_id: movie.movie_id,
      _id: movie._id,
      original_title: movie.original_title,
      original_language: movie.original_language,
      popularity: movie.popularity,
      poster_path: movie.poster_path,
      overview: movie.overview,
    }))

    const duration = Date.now() - start
    console.log(' Movies fetched from MongoDB')

    // Save to Redis with TTL
    const resp = await client.set(cacheKey, JSON.stringify(extractedMovies))
    // Set TTL using expire method
    await client.expire(cacheKey, ttl)
    console.log('Redis SET result:', resp)

    return NextResponse.json({ source: 'api', duration, data: extractedMovies })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    client.quit()
  }
} 