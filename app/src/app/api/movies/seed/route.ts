// app/api/movies/seed/route.ts
import connectMongo from "@/lib/mongodb";
import Movie from "@/models/Movie";
import { NextResponse } from "next/server";

const MOVIES_API = 'https://jsonfakery.com/movies/paginated?page=1';

export async function GET() {
  // Connect to MongoDB
  await connectMongo();

  try {
    // Fetch movies from API
    const res = await fetch(MOVIES_API);
    const json = await res.json();
    console.log('Fetched JSON response:', json);

    // Check if the response contains the expected structure
    if (!json || !json.data || !Array.isArray(json.data)) {
      throw new Error('Invalid API response format');
    }

    const movies = json.data; // Assuming the movies are inside `data.data`
    console.log('Movies data:', movies);

    // Filter out `created_at` and `updated_at` from the response and fix `adult` field
    const filteredMovies = movies.map((movie: any) => {
      const { id, created_at, updated_at, ...filteredMovie } = movie; // Destructure to remove fields
      return {
        ...filteredMovie,
        adult: filteredMovie.adult === 1, // Convert adult from number to boolean
      };
    });

    // Optional: clear old entries before seeding (can be skipped if you don't want to overwrite)
    await Movie.deleteMany({});

    // Insert new movies into the database
    const inserted = await Movie.insertMany(filteredMovies);

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
