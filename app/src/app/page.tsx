'use client'

import { useMoviesStore } from '@/stores/movies'
import { useEffect } from 'react'

export default function Home() {
  const { movies, loading, error, fetchMovies } = useMoviesStore()

  useEffect(() => {
    console.log('movies: ', movies);
    fetchMovies();
  }, []);
  
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
        {movies.map((movie) => (
          <div key={movie.id} className="border p-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-40 object-cover"
            />
            <h2 className="mt-2 font-semibold">{movie.title}</h2>
          </div>
        ))}
      </div>
    </main>
  )
}
