import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Profile
    dateOfBirth: { type: Date, required: true },
    currentCity: { type: String, required: true },
    occupation: { type: String, required: true },
    sex: { type: String, enum: ["male", "female", "other"] },

    // Email verify OTP
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },

    // Login 2FA OTP
    loginOtp: { type: String, default: "" },
    loginOtpExpireAt: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual avatar from first letter
userSchema.virtual("avatar").get(function () {
  return this.name ? this.name.charAt(0).toUpperCase() : "U";
});

export default mongoose.model("User", userSchema);