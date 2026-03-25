import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
