import { NextResponse } from 'next/server'
import connectMongo from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  try {
    const start = Date.now()
    console.log(`GET: /api/movies/direct?page=${page}`)

    // Fetch directly from MongoDB
    await connectMongo()
    const movies = await Movie.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit)
      .select('movie_id original_title original_language popularity poster_path overview backdrop_path release_date vote_average vote_count adult')
      .lean()

    if (!movies || movies.length === 0) {
      throw new Error('No movies found in the database')
    }

    const duration = Date.now() - start
    console.log(' Movies fetched directly from MongoDB')

    return NextResponse.json({ 
      source: 'mongo', 
      duration, 
      data: movies 
    })
  } catch (err: any) {
    console.error('Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
} 