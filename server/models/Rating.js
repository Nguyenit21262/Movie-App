import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ rate một movie một lần
ratingSchema.index({ user: 1, movie: 1 }, { unique: true });
ratingSchema.index({ movie: 1 });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;