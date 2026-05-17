import { httpClient } from "./httpClient";

export const getDashboardData = () => httpClient.get("/api/admin/dashboard");

export const getAdminShows = () => httpClient.get("/api/admin/all-shows");

export const getAdminBookings = () => httpClient.get("/api/admin/all-bookings");

export const getAdminChatUsers = (params = {}) =>
  httpClient.get("/api/admin/chat-users", { params });

export const getAdminChats = (params = {}) =>
  httpClient.get("/api/admin/chats", { params });

export const updateAdminChatVisibility = (chatId, payload) =>
  httpClient.patch(`/api/admin/chats/${chatId}/visibility`, payload);

export const deleteAdminChat = (chatId) =>
  httpClient.delete(`/api/admin/chats/${chatId}`);
