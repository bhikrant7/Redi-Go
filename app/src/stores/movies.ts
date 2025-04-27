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
    set({ loading: true, error: null })
    try {
      console.log('fetchMovies');
      const res = await fetch('/api/movies/cache')
      const json = await res.json()
      console.log('json: ', json);
      const data = json?.data?.map((movie: any) => {
        return {
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
        };
      })
      if (res.ok) {
        set({ movies: data, loading: false })
      } else {
        set({ error: json.error || 'Failed to load movies', loading: false })
      }
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  }
}))
