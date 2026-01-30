import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, DeleteIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverter";

const AddMovies = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dataTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");

  useEffect(() => {
    setNowPlayingMovies(dummyShowsData);
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };

  if (!nowPlayingMovies.length) return <Loading />;

  return (
    <>
      <Title text1="Add" text2="Movies" />

      <div className="max-w-6xl mt-8 space-y-10 text-black">
        {/* NOW PLAYING */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Now Playing Movies</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {nowPlayingMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() =>
                  setSelectedMovie((prev) =>
                    prev === movie.id ? null : movie.id,
                  )
                }
                className={`relative cursor-pointer rounded-md overflow-hidden border
                  ${
                    selectedMovie === movie.id
                      ? "border-yellow-500"
                      : "border-gray-200"
                  }
                  hover:-translate-y-1 transition`}
              >
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-56 object-cover"
                />

                {selectedMovie === movie.id && (
                  <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="p-2 bg-gray-600">
                  <p className="font-medium truncate">{movie.title}</p>
                  <p className="text-sm text-gray-500">{movie.release_date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SHOW CONFIG */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRICE */}
          <div>
            <label className="block text-sm font-medium mb-2">Show Price</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 w-fit">
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

          {/* DATE TIME */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Date & Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={dateTimeInput}
                onChange={(e) => setDateTimeInput(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 outline-none"
              />
              <button
                onClick={handleDateTimeAdd}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Add Time
              </button>
            </div>
          </div>
        </section>

        {/* SELECTED TIMES */}
        {Object.keys(dataTimeSelection).length > 0 && (
          <section>
            <h2 className="text-sm font-medium mb-3">Selected Date & Time</h2>

            <div className="space-y-3">
              {Object.entries(dataTimeSelection).map(([date, times]) => (
                <div key={date}>
                  <p className="font-medium">{date}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {times.map((time) => (
                      <div
                        key={time}
                        className="flex items-center gap-2 border border-yellow-400 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{time}</span>
                        <DeleteIcon
                          onClick={() => handleRemoveTime(date, time)}
                          className="w-4 h-4 text-red-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBMIT */}
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 rounded-md w-fit">
          Add Show
        </button>
      </div>
    </>
  );
};

export default AddMovies;
