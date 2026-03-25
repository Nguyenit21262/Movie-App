import { httpClient } from "./httpClient";

export const getCurrentUser = () => httpClient.get("/api/user/data");

export const updateUserProfile = (payload) =>
  httpClient.put("/api/user/update", payload);

export const getUserBookings = () => httpClient.get("/api/user/bookings");
