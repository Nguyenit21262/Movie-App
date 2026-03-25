import { httpClient } from "./httpClient";

export const getDashboardData = () => httpClient.get("/api/admin/dashboard");

export const getAdminShows = () => httpClient.get("/api/admin/all-shows");

export const getAdminBookings = () => httpClient.get("/api/admin/all-bookings");
