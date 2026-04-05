import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat";
import { getAdminBookings, getAdminShows } from "../../api/adminApi";

const ListMovies = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showsRes, bookingsRes] = await Promise.all([
          getAdminShows(),
          getAdminBookings(),
        ]);

        if (showsRes.data.success) setShows(showsRes.data.shows);
        if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPaidStats = (showId) => {
    const paidBookings = bookings.filter(
      (b) => b.show?._id === showId && b.isPaid === true
    );
    const totalBookings = paidBookings.length;
    const totalSeats = paidBookings.reduce(
      (acc, b) => acc + (b.bookedSeats?.length || 0),
      0
    );
    const earnings = paidBookings.reduce((acc, b) => acc + (b.amount || 0), 0);
    return { totalBookings, totalSeats, earnings };
  };

  if (loading) return <Loading />;

  return (
    <div className="p-5 ">
      <Title text1="List" text2="Show" />

      <div className="max-w-4xl mt-6 overflow-x-auto shadow-sm">
        <table className="w-full border-collapse border border-gray-300 text-nowrap">
          <thead>
            <tr className="bg-[#4548f8] text-white">
              <th className="border border-gray-300 p-3 font-semibold text-left pl-5">
                Movie Name
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Show Time
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Total Bookings
              </th>
              <th className="border border-gray-300 p-3 font-semibold text-left">
                Earnings
              </th>
            </tr>
          </thead>

          <tbody className="text-sm text-black">
            {shows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  No shows found
                </td>
              </tr>
            ) : (
              shows.map((show, index) => {
                const { totalBookings, earnings } = getPaidStats(show._id);

                return (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-[#F5F5F5] hover:bg-orange-50 transition-colors"
                  >
                    <td className="border border-gray-300 p-3 pl-5 font-medium">
                      {show.movie?.title || "N/A"}
                    </td>

                    <td className="border border-gray-300 p-3">
                      {dateFormat(show.showDateTime)}
                    </td>

                    {/* Chỉ tính booking đã isPaid = true */}
                    <td className="border border-gray-300 p-3 text-center">
                      {totalBookings}
                    </td>

                    {/* Chỉ tính earnings từ booking đã isPaid = true */}
                    <td className="border border-gray-300 p-3  ">
                      {earnings > 0
                        ? `${currency} ${earnings}`
                        : <span className="text-gray-400 font-normal text-xs">No paid bookings</span>
                      }
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListMovies;
