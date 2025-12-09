import React, { useEffect } from "react";
import { useState } from "react";
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
    <div>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-yellow/20 text-left text-white">
            <th className="p-2 font-medium pl-5">User Name</th>
              <th className="p-2 font-medium ">Movie Name</th>
              <th p-2 font-medium>
                Show Time
              </th>
              <th p-2 font-medium>
                Seats
              </th>
              <th p-2 font-medium>
                Amount
              </th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
          {bookings.map((item, index) => (
            <tr key={index} className="border-b border-yellow/10 bg-yellow/5 even:bg-yellow/10">
              <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
              <td className="p-2">{item.show.movie.title}</td>
              <td className="p-2">{dateFormat(item.show.showDateTime)}</td>
              <td className="p-2">{Object.keys(item.bookedSeats).map(seat => item.bookedSeats[seat]).join(", ")}</td>
              <td className="p-2">{currency} {currency} {item.amount}</td>
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
