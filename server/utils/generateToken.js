import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // 1. Tạo JWT
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 2. Thiết lập Cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;