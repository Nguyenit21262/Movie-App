import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Clock, Monitor } from "lucide-react";

const DataSelect = ({ dateTime = {}, id }) => {
  const navigate = useNavigate();
  const showtimesRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  const dates = useMemo(() => Object.keys(dateTime).sort(), [dateTime]);

  // dateTime từ DB: { "2025-01-01": [{ time, showId, showPrice }] }
  const showtimes = useMemo(() => {
    return selectedDate ? dateTime[selectedDate] || [] : [];
  }, [selectedDate, dateTime]);

  useEffect(() => {
    if (selectedDate && showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDate]);

  const onBook = useCallback(() => {
    if (!selectedDate || !selectedShowtime) {
      toast("Please select date & showtime");
      return;
    }
    // Navigate đến SeatLayout với showId
    navigate(
      `/theaters/${id}/${selectedDate}?showId=${selectedShowtime.showId}`,
    );
    window.scrollTo(0, 0);
  }, [selectedDate, selectedShowtime, navigate, id]);

  if (!dates.length) return null;

  return (
    <div className="pt-5 bg-neutral-900 min-h-[200px] pb-16">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-center text-xl font-bold text-white mb-4">
          Select Date & Time
        </h3>

        {/* DATE */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-2">
          {dates.map((date) => {
            const d = new Date(date + "T00:00:00");
            return (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedShowtime(null);
                }}
                className={`h-16 min-w-[50px] p-3 rounded-xl transition ${
                  selectedDate === date
                    ? "bg-yellow-500 text-black"
                    : "bg-zinc-800 text-gray-200 hover:bg-zinc-700"
                }`}
              >
                <div className="text-lg font-bold">{d.getDate()}</div>
                <div className="text-xs">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
              </button>
            );
          })}
        </div>

        {/* SHOWTIMES */}
        {selectedDate && (
          <div
            ref={showtimesRef}
            className="mt-8 border-t border-zinc-800 pt-6"
          >
            <p className="text-white mb-4">
              {showtimes.length} showtimes available
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showtimes.map((st) => {
                const isActive = selectedShowtime?.showId === st.showId;
                const showTime = new Date(st.time);

                return (
                  <div
                    key={st.showId}
                    onClick={() => setSelectedShowtime(st)}
                    className={`p-2 rounded-lg cursor-pointer border transition ${
                      isActive
                        ? "border-yellow-500 bg-yellow-400/10"
                        : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm font-semibold text-white">
                        {showTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">${st.showPrice}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onBook}
                disabled={!selectedShowtime}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition ${
                  selectedShowtime
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-zinc-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {selectedShowtime
                  ? `Book — $${selectedShowtime.showPrice}`
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
