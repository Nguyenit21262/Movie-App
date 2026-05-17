import mongoose from "mongoose";

const userRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Enriched recommendation objects (with poster_path resolved)
    recommendations: {
      type: Array,
      default: [],
    },
    // How many ratings the user had when this recommendation set was built
    ratingCountAtBuild: {
      type: Number,
      default: 0,
    },
    // morning | afternoon | evening | night used when this cache was built
    timeContextAtBuild: {
      type: String,
      default: "",
    },
    // 'gcn' | 'gcn-bootstrap'
    source: {
      type: String,
      default: "gcn",
    },
  },
  { timestamps: true },
);

const UserRecommendation = mongoose.model(
  "UserRecommendation",
  userRecommendationSchema,
  "recommendationcaches",
);

export default UserRecommendation;
