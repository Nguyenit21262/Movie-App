import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat";
import { toast } from "react-toastify";
import { getAdminBookings } from "../../api/adminApi";
import { updateBookingStatus } from "../../api/notificationApi";

const ListBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const getAllBookings = async () => {
      try {
        const { data } = await getAdminBookings();
        if (data.success) setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    getAllBookings();
  }, []);

  const handleAccept = async (bookingId) => {
    setUpdating(bookingId);
    try {
      const { data } = await updateBookingStatus(bookingId, { isPaid: true });

      if (data.success) {
        toast.success("Booking marked as paid");
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, isPaid: true } : b)),
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-5">
      <Title text1="List" text2="Bookings" />

      <div className="max-w-4xl mt-6 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse border border-gray-300 text-nowrap">
          <thead>
            <tr className="bg-[#4548f8] text-white">
              <th className="border border-gray-300 p-3 font-semibold text-left">
                User Name
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Movie Name
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Show Time
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Seats
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Amount
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Status
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-red-50 transition-colors odd:bg-white even:bg-[#F5F5F5]"
                >
                  <td className="border border-gray-300 p-3">
                    {item.user?.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {item.show?.movie?.title || "N/A"}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {dateFormat(item.show?.showDateTime)}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {item.bookedSeats?.join(", ")}
                  </td>
                  <td className="border border-gray-300 p-3 font-medium text-[#007BFF]">
                    {currency} {item.amount}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {item.isPaid ? (
                      <span className="text-emerald-600 font-semibold">
                        Paid
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {item.isPaid ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      <button
                        onClick={() => handleAccept(item._id)}
                        disabled={updating === item._id}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded transition-all active:scale-95"
                      >
                        {updating === item._id ? "..." : "Accept"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBooking;
