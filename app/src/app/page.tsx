"use client";

import { useMoviesStore } from "@/stores/movies";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, SendHorizontal } from "lucide-react";
import Card from "../components/custom/card";
// import Image from 'next/image';

export default function Home() {
  const { movies, loading, error, fetchMovies } = useMoviesStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    console.log('movies: ', movies);
  }, [movies]);

  return (
    <div className="min-h-screen font-geist-sans bg-gradient-to-b from-[#100719] to-[#1c1a3f] bg-fixed bg-no-repeat bg-cover flex items-center justify-center px-4">
      <main className="flex flex-col items-center justify-center w-full max-w-[1600px]">
        <h1 className="text-white text-6xl mb-20 text-center">
          <span className="drop-shadow-[0_0_8px_#fff]">GO-REDIS</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            DATABASE TESTING
          </span>
        </h1>

        <div className="relative w-full max-w-[1200px]">
          <div className="p-[5px] rounded-full bg-gradient-to-r from-pink-500 to-purple-500 relative">
            <Search color="#fff" size={36} className="absolute top-5 left-7" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-white px-24 py-8 w-full rounded-full bg-[#111014] placeholder-gray-400 border-none !text-2xl"
              placeholder="Search for a Movie"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute top-2.5 right-3 py-2.5 px-6 rounded-l-xl rounded-r-full bg-[#202020] hover:bg-purple-500 active:bg-purple-300 transition-all duration-300 cursor-pointer"
            >
              <SendHorizontal color="#fff" className="w-8 h-8" />
            </button>
          </div>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-10">
            {movies?.map((movie: any) => (
              <div key={movie.id} className="">
                <Card movie={movie} />
                {/* <Image
                  src={movie.posterPath}
                  alt={movie.originalTitle}
                  className="w-full h-40 object-cover"
                  width={200}
                  height={300}
                /> */}
                <div className="text-white text-center mt-2">
                  {movie.originalTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
