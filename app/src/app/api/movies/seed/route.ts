// app/api/movies/seed/route.ts
import connectMongo from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";
import axios from "axios";

const MOVIES_API = process.env.MOVIES_API;
const API_READ_ACCESS_TOKEN = process.env.API_READ_ACCESS_TOKEN;

export async function GET() {
  // Connect to MongoDB
  await connectMongo();

  if (!MOVIES_API) {
    return NextResponse.json(
      { error: 'MOVIES_API must be defined' },
      { status: 500 }
    );
  }
  if (!API_READ_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'API_READ_ACCESS_TOKEN must be defined' },
      { status: 500 }
    );
  }

  try {
    // Fetch movies from API
    const { data:data1 } = await axios.get(MOVIES_API || "", {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data2 } = await axios.get(`${MOVIES_API}?page=2`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });
    
    const { data: data3 } = await axios.get(`${MOVIES_API}?page=3`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data4 } = await axios.get(`${MOVIES_API}?page=4`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data5 } = await axios.get(`${MOVIES_API}?page=5`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const results: any = [
      ...data1.results,
      ...data2.results,
      ...data3.results,
      ...data4.results,
      ...data5.results,
    ];

    console.log('results: ', results);

    // Check if the response contains the expected structure
    if (!results || !Array.isArray(results)) {
      throw new Error('Invalid API response format');
    }

    const movies = results; // Assuming the movies are inside `data.data`
    console.log('Movies data:', movies);

    // Filter out `created_at` and `updated_at` from the response and fix `adult` field
    const filteredMovies = movies.map((movie: any) => {
      const { id, poster_path, ...rest } = movie;
      const newMovie = { ...rest, poster_path: `https://image.tmdb.org/t/p/original${poster_path}`, movie_id: id };
    
      // Remove unwanted fields
      delete newMovie.genre_ids;
      delete newMovie.created_at;
      delete newMovie.updated_at;
      return newMovie;
    });

    // Optional: clear old entries before seeding (can be skipped if you don't want to overwrite)
    await Movie.deleteMany({});

    // Remove duplicates based on movie_id
    const uniqueMoviesMap = new Map();

    filteredMovies.forEach((movie: any) => {
      if (!uniqueMoviesMap.has(movie.movie_id)) {
        uniqueMoviesMap.set(movie.movie_id, movie);
      }
    });

    const uniqueMovies = Array.from(uniqueMoviesMap.values());

    // Now insert uniqueMovies into Mongo
    const inserted = await Movie.insertMany(uniqueMovies);

    // Return a success message
    return NextResponse.json({
      message: "Database seeded successfully",
      insertedCount: inserted.length,
    });
  } catch (error: any) {
    // Handle errors and log the error message
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
