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
      <h1 className="text-lg font-semibold mb-6 text-white">My Bookings</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden bg-[#0f0f0f] border border-white/10">
          <thead className="bg-[#161616]">
            <tr className="text-left text-sm text-gray-400">
              <th className="px-4 py-4">Movie</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">Show Time</th>
              <th className="px-4 py-4">Seats</th>
              <th className="px-4 py-4">Tickets</th>
              <th className="px-4 py-4">Amount</th>
              <th className="px-4 py-4 text-right">Status</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item, index) => {
              const { movie } = item.show;

              return (
                <tr
                  key={index}
                  className="border-t border-white/5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="w-20 h-12 object-cover rounded-md"
                    />
                    <span className="font-medium text-white">
                      {movie.title}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {timeFormat(movie.runtime)}
                  </td>

                  <td className="px-4 py-4">
                    {dateFormat(item.show.showDateTime)}
                  </td>

                  <td className="px-4 py-4">
                    {item.bookedSeats.join(", ")}
                  </td>

                  <td className="px-4 py-4">
                    {item.bookedSeats.length}
                  </td>

                  <td className="px-4 py-4 font-semibold text-white">
                    {currency}
                    {item.amount}
                  </td>

                  <td className="px-4 py-4 text-right">
                    {!item.isPaid ? (
                      <button className="bg-indigo-600/90 hover:bg-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all">
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        Paid
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBookings;
