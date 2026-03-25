import { httpClient } from "./httpClient";

export const getOccupiedSeats = (showId) =>
  httpClient.get(`/api/bookings/seats/${showId}`);

export const createBooking = (payload) =>
  httpClient.post("/api/bookings/create", payload);
