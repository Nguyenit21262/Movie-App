import { useEffect, useState } from "react";
import { dummyBookingData } from "../assets/assets";
import Loading from "../components/Loading";
import timeFormat from "../lib/timeFormat";
import dateFormat from "../lib/dateFormat";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookings(dummyBookingData);
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((item, index) => {
        const { movie } = item.show;

        return (
          <div
            key={index}
            className="mx-auto max-w-3xl
      flex flex-col md:flex-row justify-between
      bg-yellow-500/10 border border-yellow-500/20
      rounded-lg mt-4 p-4"
          >
            {/* MOVIE INFO */}
            <div className="flex flex-col md:flex-row">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="md:max-w-45 aspect-video rounded object-cover"
              />

              <div className="p-4">
                <p className="font-semibold">{movie.title}</p>
                <p>{timeFormat(movie.runtime)}</p>
                <p>{dateFormat(item.show.showDateTime)}</p>
              </div>
            </div>

            {/* BOOKING INFO */}
            <div className="flex flex-col md:items-end md:text-right justify-between p-4">
              <div className="flex items-center gap-4">
                <p className="text-2xl font-semibold">
                  {currency}
                  {item.amount}
                </p>

                {!item.isPaid && (
                  <button className="bg-yellow-500 px-4 py-1.5 rounded-full text-sm font-medium">
                    Pay Now
                  </button>
                )}
              </div>

              <div className="text-sm mt-2">
                <p>
                  <span className="text-gray-400">Total tickets:</span>{" "}
                  {item.bookedSeats.length}
                </p>
                <p>
                  <span className="text-gray-400">Seats:</span>{" "}
                  {item.bookedSeats.join(", ")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyBookings;
