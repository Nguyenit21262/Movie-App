import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat";

const ListMovies = () => {
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const currency = import.meta.env.VITE_CURRENCY;

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "USER_1",
            B1: "USER_2",
            C1: "USER_3",
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);

  return !loading ? (
    <div className="p-5">
      <Title text1="List" text2="Show" />
      <div className="max-w-4xl mt-6 overflow-x-auto shadow-sm">
        
        <table className="w-full border-collapse border border-gray-300 text-nowrap">
          <thead>
            <tr className="bg-[#4548f8] text-white">
              <th className="border border-gray-300 p-3 font-semibold text-left pl-5">Movie Name</th>
              <th className="border border-gray-300 p-3 font-semibold text-left">Show Time</th>
              <th className="border border-gray-300 p-3 font-semibold text-left">Total Bookings</th>
              <th className="border border-gray-300 p-3 font-semibold text-left">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm text-black">
            {shows.map((show, index) => (
              <tr 
                key={index} 
                className="odd:bg-white even:bg-[#F5F5F5] hover:bg-orange-50 transition-colors"
              >
                <td className="border border-gray-300 p-3 min-w-45 pl-5 font-medium">
                  {show.movie.title}
                </td>
                <td className="border border-gray-300 p-3">
                  {dateFormat(show.showDateTime)}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {Object.keys(show.occupiedSeats).length}
                </td>
                <td className="border border-gray-300 p-3 font-bold text-[#FF8C00]">
                  {currency} {Object.keys(show.occupiedSeats).length * show.showPrice}
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

export default ListMovies;