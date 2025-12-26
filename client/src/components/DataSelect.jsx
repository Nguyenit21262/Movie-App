import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Clock, Monitor } from "lucide-react";
import { getRoomInfo } from "../assets/assets";
import time from "../lib/time";

const DataSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const showtimesRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  /* Scroll đến showtimes khi chọn ngày */
  useEffect(() => {
    if (selectedDate && showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

  const showtimes = selectedDate ? dateTime[selectedDate] || [] : [];

  const onBook = () => {
    if (!selectedDate || !selectedShowtime)
      return toast("Please select date & showtime");

    const date = new Date(selectedDate).toISOString().split("T")[0];
    navigate(`/theaters/${id}/${date}?showtime=${selectedShowtime.id}`);
    scrollTo(0, 0);
  };

  return (
    <div className="pt-30 ">
      {/* DATE SELECT */}
      <div className=" p-8 bg-yellow-500/10 border border-white/10 rounded-xl">
        <h3 className="flex items-center justify-center text-2xl font-bold text-white mb-4">
          Select Date & Time
        </h3>

        <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
          {Object.keys(dateTime).map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setSelectedShowtime(null);
              }}
              className={`min-w-[70px] p-3 rounded-xl ${
                selectedDate === date
                  ? "bg-yellow-500 text-black"
                  : "bg-white/5 text-white"
              }`}
            >
              <div className="text-lg font-bold">
                {new Date(date).getDate()}
              </div>
              <div className="text-xs">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </div>
            </button>
          ))}
        </div>

        {/* SHOWTIMES */}
        {selectedDate && (
          <div
            ref={showtimesRef}
            className="mt-8 border-t border-white/10 pt-6"
          >
            <p className="text-gray-400 mb-4">
              {showtimes.length} showtimes available
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showtimes.map((st) => {
                const room = getRoomInfo(st.roomId);
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedShowtime(st)}
                    className={`p-4 rounded-xl cursor-pointer border ${
                      selectedShowtime?.id === st.id
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-xl font-bold">{time(st.time)}</span>
                    </div>

                    <div className="text-sm text-gray-300 flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      {room.name}
                    </div>

                    <div className="text-sm text-gray-400 mt-1">
                      {room.type} • ${st.price}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOOK BUTTON */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={onBook}
                disabled={!selectedShowtime}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold ${
                  selectedShowtime
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {selectedShowtime
                  ? `Book - $${selectedShowtime.price}`
                  : "Select a Showtime"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSelect;
