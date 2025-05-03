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

    const { data: data6 } = await axios.get(`${MOVIES_API}?page=6`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data7 } = await axios.get(`${MOVIES_API}?page=7`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data8 } = await axios.get(`${MOVIES_API}?page=8`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data9 } = await axios.get(`${MOVIES_API}?page=9`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data10 } = await axios.get(`${MOVIES_API}?page=10`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data11 } = await axios.get(`${MOVIES_API}?page=11`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data12 } = await axios.get(`${MOVIES_API}?page=12`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data13 } = await axios.get(`${MOVIES_API}?page=13`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data14 } = await axios.get(`${MOVIES_API}?page=14`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data15 } = await axios.get(`${MOVIES_API}?page=15`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data16 } = await axios.get(`${MOVIES_API}?page=16`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data17 } = await axios.get(`${MOVIES_API}?page=17`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data18 } = await axios.get(`${MOVIES_API}?page=18`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data19 } = await axios.get(`${MOVIES_API}?page=19`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`
      }
    });

    const { data: data20 } = await axios.get(`${MOVIES_API}?page=20`, {
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
      ...data6.results,
      ...data7.results,
      ...data8.results,
      ...data9.results,
      ...data10.results,
      ...data11.results,
      ...data12.results,
      ...data13.results,
      ...data14.results,
      ...data15.results,
      ...data16.results,
      ...data17.results,
      ...data18.results,
      ...data19.results,
      ...data20.results,
    ];

    // Check if the response contains the expected structure
    if (!results || !Array.isArray(results)) {
      throw new Error('Invalid API response format');
    }

    const movies = results; // Assuming the movies are inside `data.data`

    // Filter out `created_at` and `updated_at` from the response and fix `adult` field
    const filteredMovies = movies.map((movie: any) => {
      const { id, poster_path, ...rest } = movie;
      
      // Ensure all required fields are present with default values
      const newMovie = {
        movie_id: id,
        original_title: movie.original_title || "",
        original_language: movie.original_language || "en",
        overview: movie.overview || "No overview available",
        popularity: movie.popularity || 0,
        poster_path: `https://image.tmdb.org/t/p/original${poster_path}`,
        backdrop_path: movie.backdrop_path || "",
        release_date: movie.release_date || "",
        vote_average: movie.vote_average || 0,
        vote_count: movie.vote_count || 0,
        adult: movie.adult || false,
        video: movie.video || false,
        title: movie.title || movie.original_title || ""
      };

      // Debug log for movies with missing overview
      if (!movie.overview) {
        console.log('Original movie missing overview:', movie.id, movie.original_title);
      }

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
