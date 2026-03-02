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

export const getPlaceholderImage = () =>
  "https://via.placeholder.com/500x750/1a1a1a/ffffff?text=No+Image";
