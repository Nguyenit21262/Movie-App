import TMDBService from "../service/TMDBService.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Booking from "../models/Booking.js";

// GET /api/show/now-playing — lấy phim đang chiếu từ TMDB
export const getNowPlayingShows = async (req, res) => {
  try {
    const data = await TMDBService.getNowPlayingMovies();
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error("Error fetching now playing:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/show/upcoming — cho AddMovies admin chọn phim để add
export const getUpcomingMovies = async (req, res) => {
  try {
    const data = await TMDBService.getUpcomingMovies();
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/show/add — admin thêm show mới
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput?.length || !showPrice) {
      return res.status(400).json({
        success: false,
        message: "movieId, showsInput and showPrice are required",
      });
    }

    let movie = await Movie.findOne({ tmdb_id: Number(movieId) });

    if (!movie) {
      const formatted = await TMDBService.formatMovieData(movieId);

      movie = await Movie.findOneAndUpdate(
        { tmdb_id: formatted.tmdb_id }, // filter
        {
          $setOnInsert: {
            // chỉ set khi INSERT mới
            tmdb_id: formatted.tmdb_id,
            title: formatted.title,
            overview: formatted.overview,
            poster_path: formatted.poster_path,
            backdrop_path: formatted.backdrop_path,
            release_date: formatted.release_date,
            original_language: formatted.original_language,
            tagline: formatted.tagline,
            genres: formatted.genres,
            keywords: formatted.keywords,
            casts: formatted.casts,
            vote_average: formatted.vote_average,
            runtime: formatted.runtime,
            count_rating: formatted.count_rating,
            popularity: formatted.popularity,
          },
        },
        {
          upsert: true, // tạo mới nếu chưa có
          new: true, // trả về document sau update
          setDefaultsOnInsert: true,
        },
      );
    }

    const showsToCreate = showsInput.flatMap((show) =>
      show.time.map((time) => ({
        movie: movie._id,
        showDateTime: new Date(`${show.date}T${time}`),
        showPrice: Number(showPrice),
        occupiedSeats: {},
      })),
    );

    await Show.insertMany(showsToCreate);

    res.json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error("Error adding show:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/show — danh sách unique movie đang có show
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    // Lọc unique theo movie._id
    const seen = new Set();
    const uniqueMovies = [];

    for (const show of shows) {
      const id = show.movie?._id?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        uniqueMovies.push(show.movie);
      }
    }

    res.json({ success: true, shows: uniqueMovies });
  } catch (error) {
    console.error("Error fetching shows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/show/:movieId — chi tiết show theo movie
export const getShowById = async (req, res) => {
  try {
    const { movieId } = req.params;

    const [shows, movie] = await Promise.all([
      Show.find({ movie: movieId, showDateTime: { $gte: new Date() } }),
      Movie.findById(movieId),
    ]);

    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found" });
    }

    // Group theo ngày
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        showPrice: show.showPrice,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("Error fetching show by id:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/show/:showId — admin xóa show
export const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Xóa các booking liên quan
    await Booking.deleteMany({ show: showId });
    await Show.findByIdAndDelete(showId);

    res.json({ success: true, message: "Show deleted successfully" });
  } catch (error) {
    console.error("deleteShow error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// PUT /api/show/:showId — admin cập nhật show
export const updateShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const { showDateTime, showPrice } = req.body;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    if (showDateTime) show.showDateTime = new Date(showDateTime);
    if (showPrice) show.showPrice = Number(showPrice);

    await show.save();

    const updated = await Show.findById(showId).populate("movie");
    res.json({ success: true, message: "Show updated successfully", show: updated });
  } catch (error) {
    console.error("updateShow error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};