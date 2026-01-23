import React, { useEffect, useState } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
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
      bg: "bg-blue-500",

      iconColor: "text-blue-800",
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue || "0"}`,
      icon: CircleDollarSignIcon,
      bg: "bg-green-500",

      iconColor: "text-green-800",
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
      bg: "bg-purple-500",

      iconColor: "text-purple-800",
    },
    {
      title: "Total User",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
      bg: "bg-orange-500",

      iconColor: "text-orange-800",
    },
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
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
              ${card.bg} ${card.border}
              border rounded-md
              hover:shadow-md transition`}
          >
            <div>
              <h1 className="text-sm text-gray-700">{card.title}</h1>
              <p className="text-xl font-semibold mt-1 text-gray-900">
                {card.value}
              </p>
            </div>
            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
          </div>
        ))}
      </div>

      {/* ACTIVE MOVIES */}
      <p className="mt-10 text-lg text-black font-medium">Active Movies</p>

      <div className="flex flex-wrap gap-4 mt-4 max-w-5xl">
        {dashboardData.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-[220px]  overflow-hidden
              bg-gray-800 border border-yellow/20
              hover:-translate-y-1 transition duration-300"
          >
            <img
              src={show.movie.poster_path}
              alt={show.movie.title}
              className="h-60 w-full object-cover"
            />

            <p className="font-medium p-2 truncate text-white">
              {show.movie.title}
            </p>

            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium text-yellow">
                {currency} {show.showPrice}
              </p>

              <p className="flex items-center gap-1 text-sm text-white">
                <StarIcon className="w-4 h-4 text-yellow fill-yellow" />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>

            <div className="px-2 pt-2 pb-3 text-sm text-gray-300">
              {dateFormat(show.showDateTime)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashBoard;
