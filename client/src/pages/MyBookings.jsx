import React, { useEffect } from "react";
import { useState } from "react";
import { dummyBookingData } from "../assets/assets";
import Loading from "../components/Loading";
import timeFormat from "../lib/timeFormat";
import dateFormat from "../lib/dateFormat";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY; //biến lưu trữ đơn vị tiền tệ
  const [bookings, setBookings] = useState([]); // thông tin của bộ phim đã book
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return !isLoading ? (
    <div className="relative px-6 md:-x-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <h1 className="text-lg font-semibold mb-4">MyBookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between bg-yellow/8 border border-yellow/20 rounded-lg mt-4 p-2 max-w-3xl"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={item.show.movie.poster_path}
              alt=""
              className="md:max-w-45 aspect-video h-auto object-cover  rounded"
            />
            <div className="flex flex-col p-4">
              <p>{item.show.movie.title}</p>
              <p className="text-lg font-semibold">
                {timeFormat(item.show.movie.runtime)}
              </p>
              <p className="text-lg font-semibold">
                {dateFormat(item.show.showDateTime)}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end md:text-right justify-between p-4">
            <div className="flex items-center gap-4">
              <p className="text-2xl font-semibold mb-3">
                {currency}
                {item.amount}
              </p>
              {!item.isPaid && (
                <button className="bg-yellow px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
                  Pay Now
                </button>
              )}
            </div>

            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Ticket:</span> {item.bookedSeats.length}
              </p>

              <p>
                <span className="text-gray-400">Total Ticket:</span> {item.bookedSeats.join(",")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
