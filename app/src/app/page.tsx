'use client'

import { useMoviesStore } from '@/stores/movies'
import { use, useEffect } from 'react'
import { Input } from "@/components/ui/input";
import { Search, SendHorizontal } from "lucide-react";

export default function Home() {
  const { movies, loading, error, fetchMovies } = useMoviesStore()

  useEffect(() => {
    console.log('movies: ', movies);
    fetchMovies();
  }, []);
  
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-[#100719] to-[#1c1a3f] flex items-center justify-center">
      <main className="flex flex-col items-center justify-center w-full">
        <h1 className="text-white text-6xl mb-30">
          <span className="drop-shadow-[0_0_8px_#fff]">GO-REDIS</span>{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">DATABASE TESTING</span>
        </h1>

        <div className="relative w-2/4">
          <div className="p-[5px] rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
            <Input
              className="text-white px-24 py-8 w-full rounded-full bg-[#111014] placeholder-gray-400 border-none !text-2xl"
              placeholder="Search for a Movie"
            />
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

          <Search color="#fff" className="absolute top-5 left-8 w-8 h-8" />

          <button className="absolute top-2.5 right-3 py-2.5 px-6 rounded-l-xl rounded-r-full bg-[#202020] hover:bg-purple-500 active:bg-purple-300 transition-all duration-300 cursor-pointer">
            <SendHorizontal color="#fff" className="w-8 h-8" />
          </button>
        </div>
      </main>
    </div>
  );
}
