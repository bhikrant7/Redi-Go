"use client";

// stores/movies.ts
import { create } from 'zustand'
import { Movie } from '@/types/movies';
import axios from 'axios';

type MoviesState = {
  movies: Movie[]
  loading: boolean
  error: string | null
  fetchMovies: (page?: number) => Promise<void>
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  loading: false,
  error: null,

  fetchMovies: async (page = 1) => {
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
        set({ movies: movies, loading: false });
      } else {
        throw new Error('No movie data available');
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
