import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ===== Thông tin cá nhân =====
    dateOfBirth: {
      type: Date,
      required: true,
    },

    currentCity: {
      type: String,
      required: true,
      trim: true,
    },

    occupation: {
      type: String,
      required: true,
      trim: true,
    },

    sex: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // ===== Xác thực =====
    verifyOtp: {
      type: String,
      default: "",
    },

    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    resetOtp: {
      type: String,
      default: "",
    },

    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "userImage.png",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.user || mongoose.model("user", userSchema);

export default User;
