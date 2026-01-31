import mongoose from "mongoose";

const castSchema = new mongoose.Schema(
  {
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    character: {
      type: String,
      required: true,
      trim: true,
    },
    profile_path: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);


const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },

    overview: {
      type: String,
      required: true,
    },

    poster_path: {
      type: String,
      default: "",
    },

    backdrop_path: {
      type: String,
      default: "",
    },

    release_date: {
      type: Date,
      required: true,
      index: true,
    },

    original_language: {
      type: String,
      required: true,
      lowercase: true,
    },

    tagline: {
      type: String,
      default: "",
    },

    genres: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    casts: {
      type: [castSchema],
      default: [],
    },

    vote_average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    runtime: {
      type: Number,
      default: 0, // minutes
    },

    keywords: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    count_rating: {
      type: Number,
      default: 0,
    },

    popularity: {
      type: Number,
      default: 0,
    },

    tmdb_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

movieSchema.index({ title: "text", overview: "text" });
movieSchema.index({ genres: 1 });
movieSchema.index({ keywords: 1 });
movieSchema.index({ popularity: -1 });
movieSchema.index({ vote_average: -1 });

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
