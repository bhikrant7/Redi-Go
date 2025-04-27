// models/Movie.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMovie extends Document {
    movie_id: number;
    original_title: string;
    original_language: string;
    overview: string;
    popularity: number;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    adult: boolean;
}

const MovieSchema = new Schema<IMovie>({
        movie_id: { type: Number, required: true, unique: true },
        original_title: { type: String, required: true },
        original_language: { type: String, required: true },
        overview: { type: String, required: true },
        popularity: { type: Number },
        poster_path: { type: String },
        backdrop_path: { type: String },
        release_date: { type: String },
        vote_average: { type: Number },
        vote_count: { type: Number },
        adult: { type: Boolean },
    }, {
        timestamps: true
    }
);

// Avoid model overwrite on hot reload
export default mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);