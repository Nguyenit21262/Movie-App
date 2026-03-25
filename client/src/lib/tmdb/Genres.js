/**
 * TMDB Genre Constants
 * Shared across Navbar and Movies components
 */

export const TMDB_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

/**
 * Get genre name by ID
 */
export const getGenreName = (genreId) => {
  return TMDB_GENRES[genreId] || "Unknown";
};

/**
 * Get genre ID by name
 */
export const getGenreId = (genreName) => {
  const entry = Object.entries(TMDB_GENRES).find(
    ([, name]) => name === genreName
  );
  return entry ? Number(entry[0]) : null;
};

/**
 * Get genres as array for dropdown
 */
export const getGenresArray = () => {
  return Object.entries(TMDB_GENRES).map(([id, name]) => ({
    id: Number(id),
    name,
  }));
};
