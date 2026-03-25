import { httpClient } from "./httpClient";

export const getNotifications = () => httpClient.get("/api/notifications");

export const markAllNotificationsRead = () =>
  httpClient.put("/api/notifications/read-all", {});

export const markNotificationRead = (notificationId) =>
  httpClient.put(`/api/notifications/read/${notificationId}`, {});

export const deleteNotification = (notificationId) =>
  httpClient.delete(`/api/notifications/${notificationId}`);

export const deleteAllNotifications = () =>
  httpClient.delete("/api/notifications/all");

export const updateBookingStatus = (bookingId, payload) =>
  httpClient.put(`/api/notifications/booking/${bookingId}/status`, payload);
