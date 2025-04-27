"use client";

// stores/movies.ts
import { create } from 'zustand'

type Movie = {
  id: number
  title: string
  poster: string
}

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
      if (res.ok) {
        set({ movies: json.data.data, loading: false })
      } else {
        set({ error: json.error || 'Failed to load movies', loading: false })
      }
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  }
}))
