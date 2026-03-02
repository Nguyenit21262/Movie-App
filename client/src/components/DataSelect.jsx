import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Clock, Monitor } from "lucide-react";
import { getRoomInfo } from "../assets/assets";
import time from "../lib/time";

const DataSelect = ({ dateTime = {}, id }) => {
  const navigate = useNavigate();
  const showtimesRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  /* Memo dates */
  const dates = useMemo(() => Object.keys(dateTime), [dateTime]);

  /* Memo showtimes */
  const showtimes = useMemo(() => {
    return selectedDate ? dateTime[selectedDate] || [] : [];
  }, [selectedDate, dateTime]);

  /* Auto scroll */
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

    const date = new Date(selectedDate).toISOString().split("T")[0];
    navigate(`/theaters/${id}/${date}?showtime=${selectedShowtime.id}`);
    window.scrollTo(0, 0);
  }, [selectedDate, selectedShowtime, navigate, id]);

  if (!dates.length) return null;

  return (
    <div className="pt-30 bg-neutral-900 min-h-[300px] pb-16">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-center text-2xl font-bold text-white mb-4">
          Select Date & Time
        </h3>

        {/* DATE */}
        <div className="flex justify-center gap-3 overflow-x-auto pb-2">
          {dates.map((date) => {
            const d = new Date(date);
            return (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedShowtime(null);
                }}
                className={`min-w-[70px] p-3 rounded-xl transition ${
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
          <div ref={showtimesRef} className="mt-8 border-t border-zinc-800 pt-6">
            <p className="text-gray-400 mb-4">
              {showtimes.length} showtimes available
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showtimes.map((st) => {
                const room = getRoomInfo(st.roomId);
                const isActive = selectedShowtime?.id === st.id;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedShowtime(st)}
                    className={`p-4 rounded-xl cursor-pointer border transition ${
                      isActive
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-xl font-bold text-gray-100">
                        {time(st.time)}
                      </span>
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
