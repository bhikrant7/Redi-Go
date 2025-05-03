import { NextResponse } from 'next/server'
import { RedisClient } from '@/lib/redis'
import connectMongo from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(req: Request) {
  console.log('GET')

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit
  const cacheKey = `movies:page:${page}`

  const client = new RedisClient()

  try {
    const start = Date.now()
    console.log(`GET: /api/movies/cache?page=${page}`)

    // 1️⃣ Try Redis cache
    const cached = await client.get(cacheKey)
    if (cached) {
      console.log(' Cache HIT')
      const duration = Date.now() - start
      return NextResponse.json({ source: 'cache', duration, data: JSON.parse(cached) })
    }

    console.log(' Cache MISS')

    // 2️⃣ Fetch from MongoDB with optimized query
    await connectMongo()
    const movies = await Movie.find()
      .sort({ _id: 1 }) // Add sorting for consistent pagination
      .skip(skip)
      .limit(limit)
      .select('movie_id original_title original_language popularity poster_path overview') // Only select needed fields
      .lean()

    if (!movies || movies.length === 0) {
      throw new Error('No movies found in the database')
    }

    // 3️⃣ Extract only required fields
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

    // 4️⃣ Save to Redis 
    const resp = await client.set(cacheKey, JSON.stringify(extractedMovies))
    console.log('Redis SET result:', resp)

    return NextResponse.json({ source: 'api', duration, data: extractedMovies })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  } finally {
    client.quit()
  }
}
