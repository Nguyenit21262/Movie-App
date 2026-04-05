import Movie from "../models/Movie.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeMovie = (movie) => ({
  id: movie._id,
  tmdb_id: movie.tmdb_id,
  title: movie.title,
  overview: movie.overview,
  genres: movie.genres || [],
  keywords: movie.keywords || [],
  runtime: movie.runtime || 0,
  vote_average: movie.vote_average || 0,
  release_date: movie.release_date,
  casts: (movie.casts || []).slice(0, 5).map((cast) => ({
    actor: cast.actor,
    character: cast.character,
  })),
});

const buildRegexConditions = (question) => {
  const tokens = question
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .slice(0, 8);

  return tokens.map((token) => {
    const regex = new RegExp(escapeRegex(token), "i");

    return {
      $or: [
        { title: regex },
        { overview: regex },
        { genres: regex },
        { keywords: regex },
        { "casts.actor": regex },
        { "casts.character": regex },
      ],
    };
  });
};

export const retrieveMovieContext = async (question, limit = 5) => {
  const trimmedQuestion = question?.trim();
  if (!trimmedQuestion) return [];

  const regexConditions = buildRegexConditions(trimmedQuestion);

  let results = [];

  try {
    results = await Movie.find(
      { $text: { $search: trimmedQuestion } },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" }, popularity: -1, vote_average: -1 })
      .limit(limit)
      .lean();
  } catch {
    results = [];
  }

  if (!results.length && regexConditions.length) {
    results = await Movie.find({ $and: regexConditions })
      .sort({ popularity: -1, vote_average: -1, count_rating: -1 })
      .limit(limit)
      .lean();
  }

  if (!results.length) {
    results = await Movie.find({})
      .sort({ popularity: -1, vote_average: -1, count_rating: -1 })
      .limit(Math.min(limit, 3))
      .lean();
  }

  return results.map(normalizeMovie);
};

export const formatMovieContext = (movies) => {
  if (!movies.length) {
    return "No relevant movie context was found in the local database.";
  }

  return movies
    .map((movie, index) => {
      const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "Unknown";

      return [
        `Movie ${index + 1}: ${movie.title} (${year})`,
        `Genres: ${movie.genres.join(", ") || "Unknown"}`,
        `Rating: ${movie.vote_average || "N/A"}/10`,
        `Runtime: ${movie.runtime || "N/A"} minutes`,
        `Keywords: ${movie.keywords.join(", ") || "None"}`,
        `Cast: ${movie.casts.map((cast) => `${cast.actor} as ${cast.character}`).join(", ") || "Unknown"}`,
        `Overview: ${movie.overview || "No overview available."}`,
      ].join("\n");
    })
    .join("\n\n");
};
