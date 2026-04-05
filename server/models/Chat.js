import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      retrievedMovies: [
        {
          tmdb_id: Number,
          title: String,
        },
      ],
      recommendedMovies: [
        {
          tmdb_id: Number,
          title: String,
          score: Number,
          source: String,
        },
      ],
      provider: {
        type: String,
        default: "fallback",
      },
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
