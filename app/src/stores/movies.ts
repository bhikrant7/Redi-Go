"use client";

// stores/movies.ts
import { create } from 'zustand'
import { Movie } from '@/types/movies';

type MoviesState = {
  movies: Movie[]
  loading: boolean
  error: string | null
  fetchMovies: () => Promise<void>
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  loading: false,
  error: null,

  fetchMovies: async () => {
    set({ loading: true, error: null });
    try {
      console.log('fetchMovies');
      const res = await fetch('/api/movies/cache');
      
      // Check for successful response before parsing JSON
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to load movies');
      }

      const json = await res.json();
      console.log('json: ', json);

      // Ensure json.data exists before mapping
      if (json?.data) {
        const data = json.data.map((movie: any) => ({
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
        set({ movies: data, loading: false });
      } else {
        throw new Error('No movie data available');
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
