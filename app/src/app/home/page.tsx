"use client";

import { useMoviesStore } from "@/stores/movies";
import { useEffect, useRef, useState } from "react";
import Card from "../../components/custom/card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { movies, loading, error, fetchMovies, source } = useMoviesStore();

  const [currentPage, setCurrentPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMovies(currentPage);
  }, [fetchMovies, currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, loading]);

  return (
    <div className="min-h-screen font-geist-sans bg-gradient-to-b from-[#100719] to-[#1c1a3f] bg-fixed bg-no-repeat bg-cover px-6 py-10">
      <div className="flex flex-col items-center w-full max-w-[1600px] mx-auto">
        <h1 className="text-white text-6xl mb-10 text-center font-bold">
          <span className="drop-shadow-[0_0_8px_#fff]">MOVIE</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            EXPLORER
          </span>
        </h1>
        {source && (
          <div className="mb-6 px-4 py-2 rounded bg-black/30 text-white text-sm backdrop-blur-md border border-white/10 shadow-md">
            🎬 Data loaded from:
            <span
              className={`ml-2 font-semibold ${
                source === "cache" ? "text-green-400" : "text-blue-400"
              }`}
            >
              {source === "cache" ? "Redis Cache" : "MongoDB"}
            </span>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-6 w-full">
          {movies.map((movie: any) => (
            <div
              key={movie.id || movie._id}
              className="flex flex-col items-center"
            >
              <Card movie={movie} />
              <div className="text-white text-center mt-2">
                {movie.originalTitle}
              </div>
            </div>
          ))}
        </div>

        {/* Loading Spinner or Observer Target */}
        <div ref={loaderRef} className="mt-10">
          {loading && (
            <Loader2 className="animate-spin text-white w-10 h-10 mx-auto" />
          )}
        </div>
      </div>
    </div>
  );
}
