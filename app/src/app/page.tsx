"use client";

import { useMoviesStore } from "@/stores/movies";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, SendHorizontal } from "lucide-react";
import Card from "../components/custom/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";

export default function Home() {
  const { moviesByPage, loading, error, fetchMoviesByPage, searchMovies, isSearching, searchQuery, source, fetchMoviesDirect } = useMoviesStore();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    if (isSearching) {
      searchMovies(searchQuery, page);
    }
  };

  const handleSearch = async () => {
    if (query?.toLowerCase().trim() === "") {
      // If search query is empty, reset to normal pagination
      setCurrentPage(1);
      fetchMoviesByPage(1);
      return;
    }
    setCurrentPage(1);
    searchMovies(query?.toLowerCase().trim(), 1);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchMoviesByPage(currentPage);
    }
  }, [fetchMoviesByPage, currentPage, isSearching]);

  useEffect(() => {
    console.log('moviesByPage: ', moviesByPage);
  }, [moviesByPage]);

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
              onKeyPress={handleKeyPress}
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

          {source && (
            <div className="mb-6 px-4 py-2 w-fit mx-auto rounded bg-black/30 text-white text-sm backdrop-blur-md border border-white/10 shadow-md">
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

          <div className="flex justify-center mb-6">
            <button
              onClick={() => fetchMoviesDirect(currentPage)}
              disabled={loading}
              className="px-6 py-2 rounded-full bg-purple-500 hover:bg-purple-600 active:bg-purple-400 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fetch Directly from MongoDB
            </button>
          </div>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          {loading && <p className="text-white text-center mt-4">Loading...</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-10">
            {moviesByPage?.map((movie: any) => (
              <div key={movie.id} className="">
                <Card movie={movie} />
                <div className="text-white text-center mt-2">
                  {movie.originalTitle}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination className="mt-6 justify-center text-white">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href= "#" onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
              
              {[1, 2, 3, 4, 5].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    // href={`?page=${page}`}
                    href="#"
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? 'bg-white text-black' : ''}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </div>
  );
}
