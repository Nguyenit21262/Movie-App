import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      default: "",
      trim: true,
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
          score: Number,
        },
      ],
      activeMovie: {
        tmdb_id: Number,
        title: String,
        score: Number,
      },
      provider: {
        type: String,
        default: "fallback",
      },
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    hiddenAt: {
      type: Date,
      default: null,
    },
    hiddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

chatSchema.index({ user: 1, createdAt: -1, _id: -1 });
chatSchema.index({ user: 1, conversationId: 1, createdAt: -1, _id: -1 });
chatSchema.index({ "metadata.provider": 1, createdAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
