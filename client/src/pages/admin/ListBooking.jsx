import React, { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat";

const ListBooking = () => {
  const [isloading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const currency = import.meta.env.VITE_CURRENCY;

  const getAllBookings = async () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    getAllBookings();
  }, []);

  return !isloading ? (
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
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {bookings.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-red-50 transition-colors odd:bg-white even:bg-[#F5F5F5]"
              >
                <td className="border border-gray-300 p-3">{item.user.name}</td>
                <td className="border border-gray-300 p-3">
                  {item.show.movie.title}
                </td>
                <td className="border border-gray-300 p-3">
                  {dateFormat(item.show.showDateTime)}
                </td>
                <td className="border border-gray-300 p-3">
                  {Object.keys(item.bookedSeats)
                    .map((seat) => item.bookedSeats[seat])
                    .join(", ")}
                </td>
                <td className="border border-gray-300 p-3 font-medium text-[#007BFF]">
                  {currency} {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default ListBooking;
