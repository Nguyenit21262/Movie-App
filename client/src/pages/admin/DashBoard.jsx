import React, { useEffect, useState } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  StarIcon,
} from "lucide-react";

import { dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat.js";

const DashBoard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });

  const [loading, setLoading] = useState(true);

  const dashboardCard = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue || "0"}`,
      icon: CircleDollarSignIcon,
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Total User",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  useEffect(() => {
    setDashboardData(dummyDashboardData);
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {dashboardCard.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-4 py-3
              ${card.bg}
              border border-gray-200 rounded-md`}
          >
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
          </div>
        ))}
      </div>

      {/* ACTIVE MOVIES TABLE */}
      <p className="mt-10 text-lg font-semibold text-gray-900">
        Active Movies
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Movie
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Rating
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Show Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Price
              </th>
            </tr>
          </thead>

          <tbody>
            {dashboardData.activeShows.map((show) => (
              <tr
                key={show._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={show.movie.poster_path}
                    alt={show.movie.title}
                    className="w-16 h-auto rounded"
                  />
                  <span className="font-medium text-gray-900">
                    {show.movie.title}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-800">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {show.movie.vote_average.toFixed(1)}
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {dateFormat(show.showDateTime)}
                </td>

                <td className="px-4 py-3 font-semibold text-gray-900">
                  {currency} {show.showPrice || show.price || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DashBoard;
