"use client";

import { useMoviesStore } from "@/stores/movies";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, SendHorizontal } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const { movies, loading, error, fetchMovies } = useMoviesStore();

  useEffect(() => {
    console.log("movies: ", movies);
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    console.log('movies: ', movies);
  }, [movies]);

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-[#100719] to-[#1c1a3f] flex items-center justify-center">
      <main className="flex flex-col items-center justify-center w-full">
        <h1 className="text-white text-6xl mb-20">
          <span className="drop-shadow-[0_0_8px_#fff]">GO-REDIS</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            DATABASE TESTING
          </span>
        </h1>

        <div className="relative w-2/4">
          <div className="p-[5px] rounded-full bg-gradient-to-r from-pink-500 to-purple-500">
            <Search color="#fff" size={36} className="absolute top-5 left-7" />
            <Input
              className="text-white px-24 py-8 w-full rounded-full bg-[#111014] placeholder-gray-400 border-none !text-2xl"
              placeholder="Search for a Movie"
            />
            <button
              onClick={fetchMovies}
              disabled={loading}
              className="absolute top-2.5 right-3 py-2.5 px-6 rounded-l-xl rounded-r-full bg-[#202020] hover:bg-purple-500 active:bg-purple-300 transition-all duration-300 cursor-pointer">
              <SendHorizontal color="#fff" className="w-8 h-8" />
            </button>{" "}
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {movies?.map((movie) => (
              <div key={movie.id} className="border p-4 relative">
                <Image
                  src={movie.posterPath}
                  alt={movie.originalTitle}
                  className="w-full h-40 object-cover"
                  width={200}
                  height={300}
                />
                <h2 className="mt-2 font-semibold text-white">{movie.originalTitle}</h2>
                <Search
                  color="#fff"
                  className="absolute top-5 left-8 w-8 h-8"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
