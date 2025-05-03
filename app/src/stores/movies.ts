"use client";

import { create } from "zustand";
import { Movie } from "@/types/movies";
import axios from "axios";

type MoviesState = {
  movies: Movie[];
  moviesByPage: Movie[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  source: string;
  isSearching: boolean;
  searchQuery: string;
  fetchMovies: (page?: number) => Promise<void>;
  fetchMoviesByPage: (page?: number) => Promise<void>;
  searchMovies: (query: string, page?: number) => Promise<void>;
  resetMovies: () => void;
};

export const useMoviesStore = create<MoviesState>((set, get) => ({
  movies: [],
  moviesByPage: [],
  loading: false,
  error: null,
  hasMore: true,
  source: "",
  isSearching: false,
  searchQuery: "",

  fetchMovies: async (page = 1) => {
    const { movies } = get();
    set({ loading: true, error: null });

    try {
      console.log("fetchMovies - page:", page);
      const { data } = await axios.get(`/api/movies/cache?page=${page}`);

      // Expecting `data.source` to be either "cache" or "mongo"
      const responseSource = data?.source ?? "";

      const newMovies = data?.data?.map((movie: any) => ({
        id: movie._id,
        movieId: movie.movie_id,
        originalTitle: movie.original_title,
        originalLanguage: movie.original_language,
        overview: movie.overview,
        popularity: movie.popularity,
        posterPath: movie.poster_path,
        // backdropPath: movie.backdrop_path,
        // releaseDate: movie.release_date,
        // voteAverage: movie.vote_average,
        // voteCount: movie.vote_count,
        // adult: movie.adult,
      }));

      if (!newMovies || newMovies.length === 0) {
        set({ hasMore: false, loading: false });
        return;
      }

      // Prevent duplicates using movieId
      const allMovies = [
        ...movies,
        ...newMovies.filter(
          (newMovie: Movie) =>
            !movies.some((m) => m.movieId === newMovie.movieId)
        ),
      ];

      set({
        movies: allMovies,
        loading: false,
        hasMore: true,
        source: responseSource, 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMoviesByPage: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      console.log('fetchMovies');
      const { data } = await axios.get(`/api/movies/cache?page=${page}`);

      // Ensure json.data exists before mapping
      if (data) {
        const movies = data?.data?.map((movie: any) => ({
          id: movie._id,
          movieId: movie.movie_id,
          originalTitle: movie.original_title,
          originalLanguage: movie.original_language,
          overview: movie.overview,
          popularity: movie.popularity,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
          adult: movie.adult
        }));
        set({ moviesByPage: movies, loading: false, source: data.source });
      } else {
        throw new Error('No movie data available');
      }
    } catch (err: any) {
      set({ error: err?.response?.data?.error, loading: false });
    }
  },

  searchMovies: async (query: string, page = 1) => {
    set({ loading: true, error: null, isSearching: true, searchQuery: query });
    try {
      console.log('searchMovies');
      const { data } = await axios.get(`/api/movies/search?q=${query}&page=${page}`);

      if (data) {
        const movies = data?.data?.map((movie: any) => ({
          id: movie._id,
          movieId: movie.movie_id,
          originalTitle: movie.original_title,
          originalLanguage: movie.original_language,
          overview: movie.overview,
          popularity: movie.popularity,
          posterPath: movie.poster_path,
          backdropPath: movie.backdrop_path,
          releaseDate: movie.release_date,
          voteAverage: movie.vote_average,
          voteCount: movie.vote_count,
          adult: movie.adult
        }));
        set({ moviesByPage: movies, loading: false, source: data.source });
      } else {
        throw new Error('No movie data available');
      }
    } catch (err: any) {
      set({ error: err?.response?.data?.error, loading: false });
    }
  },

  resetMovies: () => {
    set({ movies: [], hasMore: true, error: null });
  },
}));

// "use client";

// // stores/movies.ts
// import { create } from 'zustand'
// import { Movie } from '@/types/movies';
// import axios from 'axios';

// type MoviesState = {
//   movies: Movie[]
//   loading: boolean
//   error: string | null
//   fetchMovies: (page?: number) => Promise<void>
// }

// export const useMoviesStore = create<MoviesState>((set) => ({
//   movies: [],
//   loading: false,
//   error: null,

//   fetchMovies: async (page = 1) => {
//     set({ loading: true, error: null });
//     try {
//       console.log('fetchMovies');
//       const { data } = await axios.get(`/api/movies/cache?page=${page}`);

//       // Ensure json.data exists before mapping
//       if (data) {
//         const movies = data?.data?.map((movie: any) => ({
//           id: movie._id,
//           movieId: movie.movie_id,
//           originalTitle: movie.original_title,
//           originalLanguage: movie.original_language,
//           overview: movie.overview,
//           popularity: movie.popularity,
//           posterPath: movie.poster_path,
//           backdropPath: movie.backdrop_path,
//           releaseDate: movie.release_date,
//           voteAverage: movie.vote_average,
//           voteCount: movie.vote_count,
//           adult: movie.adult
//         }));
//         set({ movies: movies, loading: false });
//       } else {
//         throw new Error('No movie data available');
//       }
//     } catch (err: any) {
//       set({ error: err.message, loading: false });
//     }
//   }
// }));
