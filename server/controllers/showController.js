import Movie from "../models/Movie.js";
export const getNowPlayingShows = async (req, res) => {
  try {
    const { data } = await TMDBService.getNowPlayingMovies();
    {
      Headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`;
      }
    }
    const movie = data.results;
    res.json({ success: true, movies: movie });
  } catch (error) {
    console.error("Error fetching now playing shows:", error);
    res.status(500).json({ error: error.message });
  }
};

//api to add show to the db

export const addShow = async (req, res) => {
  try { // Đã thêm try vào đây
    const { movieId, showsInput, showPrice } = req.body; // Thêm showsInput
    let movie = await Movie.findById(movieId);
    
    if (!movie) {
      // Fetch từ TMDB
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        TMDBService.getMovieDetails(movieId), // Giả sử auth đã cấu hình trong axios instance
        TMDBService.getMovieCredits(movieId),
      ]);

      const details = movieDetailsResponse.data;
      const credits = movieCreditsResponse.data;

      movie = await Movie.create({
        title: details.title,
        overview: details.overview,
        poster_path: details.poster_path, // Đã sửa tên
        backdrop_path: details.backdrop_path,
        genres: details.genres.map((g) => g.name),
        cast: credits.cast.slice(0, 5).map((c) => c.name),
        release_date: details.release_date,
        original_language: details.original_language,
        tagline: details.tagline || "",
        vote_average: details.vote_average,
        run_time: details.runtime,
      });
    }

    const showsToCreate = showsInput.flatMap((show) => 
      show.time.map((time) => ({
        movie: movie._id,
        showDateTime: new Date(`${show.date}T${time}`),
        showPrice,
        occupiedSeats: {},
      }))
    );

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error("Error adding shows:", error);
    res.status(500).json({ error: error.message });
  }
};