'use client'

import { useMoviesStore } from '@/stores/movies'
import { use, useEffect } from 'react'

export default function Home() {
  const { movies, loading, error, fetchMovies } = useMoviesStore()

  useEffect(() => {
    console.log('movies: ', movies);
    fetchMovies();
  }, []);

  useEffect(() => {
    console.log('movies: ', movies);
  }, [movies]);
  
  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Movies Collection</h1>

      <button
        onClick={fetchMovies}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Fetch Movies'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="grid grid-cols-2 gap-4 mt-6">
        {movies?.map((movie) => (
          <div key={movie.id} className="border p-4">
            <img
              src={movie.posterPath}
              alt={movie.originalTitle}
              className="w-full h-40 object-cover"
            />
            <h2 className="mt-2 font-semibold">{movie.originalTitle}</h2>
          </div>
        ))}
      </div>
    </main>
  )
}
