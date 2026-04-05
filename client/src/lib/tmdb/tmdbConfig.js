const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const getTMDBImageUrl = (path, size = "original") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getTMDBPosterUrl = (path, size = "w500") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getTMDBBackdropUrl = (path, size = "w1280") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getTMDBProfileUrl = (path, size = "w185") => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Inline SVG placeholder — không cần mạng, không bao giờ bị ERR_CONNECTION_CLOSED
export const getPlaceholderImage = () =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%231a1a1a'/%3E%3Crect x='175' y='280' width='150' height='120' rx='8' fill='%23333'/%3E%3Ccircle cx='210' cy='310' r='18' fill='%23555'/%3E%3Cpolygon points='175,400 260,320 325,380 355,345 325,400' fill='%23444'/%3E%3Ctext x='250' y='460' font-family='Arial,sans-serif' font-size='22' fill='%23666' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;
