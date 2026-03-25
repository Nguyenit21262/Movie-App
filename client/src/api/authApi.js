import { httpClient } from "./httpClient";

export const registerUser = (payload) =>
  httpClient.post("/api/auth/register", payload);

export const loginUser = (payload) =>
  httpClient.post("/api/auth/login", payload);

export const verifyLoginOtp = (payload) =>
  httpClient.post("/api/auth/verify-login-otp", payload);

export const verifyAccount = (payload) =>
  httpClient.post("/api/auth/verify-account", payload);

export const sendPasswordResetOtp = (payload) =>
  httpClient.post("/api/auth/send-reset-otp", payload);

export const resetPassword = (payload) =>
  httpClient.post("/api/auth/reset-password", payload);

export const logoutUserRequest = () => httpClient.post("/api/auth/logout");
