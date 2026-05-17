import axios from "axios";

const stripWrappedQuotes = (value = "") => value.replace(/^['"]+|['"]+$/g, "");

const normalizeApiBaseUrl = (value) => {
  if (!value) return "";

  return stripWrappedQuotes(String(value).trim()).replace(/\/+$/, "");
};

const shouldUseSameOriginApi = (configuredBaseUrl) => {
  if (!configuredBaseUrl) return true;
  if (typeof window === "undefined") return false;

  const currentHost = window.location.hostname;
  if (!currentHost || /^(localhost|127\.0\.0\.1)$/i.test(currentHost)) {
    return false;
  }

  try {
    const configuredUrl = new URL(configuredBaseUrl, window.location.origin);
    return /^(localhost|127\.0\.0\.1)$/i.test(configuredUrl.hostname);
  } catch {
    return false;
  }
};

const configuredApiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_BACKEND_URL);

export const API_BASE_URL = shouldUseSameOriginApi(configuredApiBaseUrl)
  ? ""
  : configuredApiBaseUrl;

export const resolveApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const httpClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
