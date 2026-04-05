import Movie from "../models/Movie.js";
import Rating from "../models/Rating.js";
import TMDBService from "../service/TMDBService.js";

const normalizeStarRatingToTen = (rating) => Number(rating) * 2;

const roundAverage = (value) => Math.round(value * 10) / 10;

const ensureMovieByTmdbId = async (tmdbId) => {
  let movie = await Movie.findOne({ tmdb_id: Number(tmdbId) });

  if (movie) return movie;

  const formatted = await TMDBService.formatMovieData(tmdbId);
  movie = await Movie.create(formatted);
  return movie;
};

const updateMovieAggregateRating = async ({ movie, previousRating, newRating }) => {
  const currentAverage = Number(movie.vote_average || 0);
  const currentCount = Number(movie.count_rating || 0);
  const previousNormalized = previousRating
    ? normalizeStarRatingToTen(previousRating)
    : null;
  const nextNormalized = normalizeStarRatingToTen(newRating);

  let nextAverage = currentAverage;
  let nextCount = currentCount;

  if (previousNormalized === null) {
    const total = currentAverage * currentCount + nextNormalized;
    nextCount = currentCount + 1;
    nextAverage = nextCount > 0 ? total / nextCount : 0;
  } else {
    const total = currentAverage * currentCount - previousNormalized + nextNormalized;
    nextAverage = currentCount > 0 ? total / currentCount : nextNormalized;
  }

  movie.vote_average = roundAverage(nextAverage);
  movie.count_rating = nextCount;
  await movie.save();

  return movie;
};

export const submitMovieRating = async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const ratingValue = Number(req.body?.rating);

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const movie = await ensureMovieByTmdbId(tmdbId);

    let rating = await Rating.findOne({
      user: req.userId,
      movie: movie._id,
    });

    const previousRating = rating?.rating ?? null;

    if (rating) {
      rating.rating = ratingValue;
      rating.processed = false;
      await rating.save();
    } else {
      rating = await Rating.create({
        user: req.userId,
        movie: movie._id,
        rating: ratingValue,
        processed: false,
      });
    }

    await updateMovieAggregateRating({
      movie,
      previousRating,
      newRating: ratingValue,
    });

    rating.processed = true;
    await rating.save();

    return res.json({
      success: true,
      message: previousRating ? "Rating updated successfully" : "Rating submitted successfully",
      userRating: rating.rating,
      movieRating: {
        vote_average: movie.vote_average,
        count_rating: movie.count_rating,
      },
    });
  } catch (error) {
    console.error("submitMovieRating error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit rating",
    });
  }
};

export const getMyMovieRating = async (req, res) => {
  try {
    const movie = await Movie.findOne({ tmdb_id: Number(req.params.tmdbId) });

    if (!movie) {
      return res.json({
        success: true,
        userRating: null,
        movieRating: null,
      });
    }

    const rating = await Rating.findOne({
      user: req.userId,
      movie: movie._id,
    }).lean();

    return res.json({
      success: true,
      userRating: rating?.rating ?? null,
      movieRating: {
        vote_average: movie.vote_average,
        count_rating: movie.count_rating,
      },
    });
  } catch (error) {
    console.error("getMyMovieRating error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load rating",
    });
  }
};
