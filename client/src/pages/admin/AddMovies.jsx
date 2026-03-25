import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckIcon, DeleteIcon } from "lucide-react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import {
  addShow,
  getAdminNowPlayingMovies,
  getAdminUpcomingMovies,
} from "../../api/showApi";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w300";

const AddMovies = () => {
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "nowPlaying"
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch cả 2 danh sách song song
  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        const [upcomingRes, nowPlayingRes] = await Promise.all([
          getAdminUpcomingMovies(),
          getAdminNowPlayingMovies(),
        ]);

        if (upcomingRes.data.success) {
          setUpcomingMovies(upcomingRes.data.movies);
        }
        if (nowPlayingRes.data.success) {
          setNowPlayingMovies(nowPlayingRes.data.movies);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return toast.error("Please select a date & time");
    if (new Date(dateTimeInput) <= new Date())
      return toast.error("Please select a future date & time");

    const [date, time] = dateTimeInput.split("T");
    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (times.includes(time)) {
        toast.error("This time slot already exists");
        return prev;
      }
      return { ...prev, [date]: [...times, time] };
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filtered = prev[date].filter((t) => t !== time);
      if (filtered.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filtered };
    });
  };

  const handleSubmit = async () => {
    if (!selectedMovie) return toast.error("Please select a movie");
    if (!showPrice || Number(showPrice) <= 0)
      return toast.error("Please enter a valid price");
    if (Object.keys(dateTimeSelection).length === 0)
      return toast.error("Please add at least one show time");

    const showsInput = Object.entries(dateTimeSelection).map(
      ([date, time]) => ({ date, time }),
    );

    setSubmitting(true);
    try {
      const { data } = await addShow({
        movieId: selectedMovie.id,
        showsInput,
        showPrice: Number(showPrice),
      });

      if (data.success) {
        toast.success(`"${selectedMovie.title}" added to theaters!`);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
      } else {
        toast.error(data.message || "Failed to add shows");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  const displayMovies =
    activeTab === "upcoming" ? upcomingMovies : nowPlayingMovies;

  return (
    <>
      <Title text1="Add" text2="Movies" />

      <div className="max-w-6xl mt-8 space-y-10 text-black">
        {/* ── TABS ── */}
        <section>
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            {[
              {
                key: "upcoming",
                label: "Upcoming Movies",
                count: upcomingMovies.length,
              },
              {
                key: "nowPlaying",
                label: "Now Playing",
                count: nowPlayingMovies.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${
                    activeTab === tab.key
                      ? "border-yellow-500 text-yellow-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                  ${
                    activeTab === tab.key
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── MOVIE GRID ── */}
          {displayMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-4xl mb-3">🎬</span>
              <p>No movies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayMovies.map((movie) => {
                const isSelected = selectedMovie?.id === movie.id;
                return (
                  <div
                    key={movie.id}
                    onClick={() =>
                      setSelectedMovie((prev) =>
                        prev?.id === movie.id ? null : movie,
                      )
                    }
                    className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200 hover:-translate-y-1
                      ${
                        isSelected
                          ? "border-yellow-500 shadow-md shadow-yellow-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={`${TMDB_IMAGE}${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-56 object-cover"
                    />

                    {/* Selected overlay */}
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-yellow-400/15" />
                        <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1 shadow">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      </>
                    )}

                    {/* Release date badge cho upcoming */}
                    {activeTab === "upcoming" && movie.release_date && (
                      <div className="absolute bottom-14 left-0 right-0 mx-2">
                        <span className="block text-center text-xs bg-blue-600/80 text-white rounded px-1 py-0.5">
                          {movie.release_date}
                        </span>
                      </div>
                    )}

                    <div
                      className={`p-2 ${isSelected ? "bg-yellow-500" : "bg-gray-600"} transition-colors`}
                    >
                      <p className="font-medium truncate text-sm text-white">
                        {movie.title}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {movie.release_date?.slice(0, 4)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SELECTED PREVIEW ── */}
        {selectedMovie && (
          <section className="flex items-center gap-4 p-4 bg-white border border-black rounded-lg">
            <img
              src={`${TMDB_IMAGE}${selectedMovie.poster_path}`}
              alt={selectedMovie.title}
              className="w-12 h-16 object-cover rounded shadow"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {selectedMovie.title}
              </p>
              <p className="text-sm text-gray-500">
                {selectedMovie.release_date} {" "}
              </p>
              <p className="text-xs text-yellow-600 font-medium mt-0.5">
                Selected — configure price & times below 
              </p>
            </div>
            <button
              onClick={() => setSelectedMovie(null)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              ✕ 
            </button>
          </section>
        )}

        {/* ── PRICE + DATETIME ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Show Price</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 w-fit focus-within:border-yellow-500 transition-colors">
              <span className="text-gray-500">{currency}</span>
              <input
                type="number"
                min={0}
                value={showPrice}
                onChange={(e) => setShowPrice(e.target.value)}
                placeholder="Enter price"
                className="outline-none w-32"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Date & Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={dateTimeInput}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setDateTimeInput(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-yellow-500"
              />
              <button
                onClick={handleDateTimeAdd}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Add Time
              </button>
            </div>
          </div>
        </section>

        {/* ── TIME SLOTS ── */}
        {Object.keys(dateTimeSelection).length > 0 && (
          <section>
            <h2 className="text-sm font-medium mb-3">Selected Date & Time</h2>
            <div className="space-y-3">
              {Object.entries(dateTimeSelection)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, times]) => (
                  <div key={date}>
                    <p className="font-medium text-gray-700">
                      {new Date(date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {times.sort().map((time) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 border border-yellow-400 bg-yellow-50 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{time}</span>
                          <DeleteIcon
                            onClick={() => handleRemoveTime(date, time)}
                            className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── SUBMIT ── */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedMovie}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-2.5 rounded-md transition-all active:scale-95"
        >
          {submitting ? "Adding..." : "Add Show"}
        </button>
      </div>
    </>
  );
};

export default AddMovies;
