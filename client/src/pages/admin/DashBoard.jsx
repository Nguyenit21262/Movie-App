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
    },

    {
      title: "Total Revenue",
      value: dashboardData.totalRevenue || "0",
      icon: CircleDollarSignIcon,
    },

    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
    },

    {
      title: "Total User",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
    },
  ];

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return !loading ? (
    <>
      <Title text1="Admin" text2="Dashboard" />

      <div className="relative flex flex-wrap gap-5 mt-6">
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCard.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-yellow border border-yellow rounded-md max-w-50 w-full"
            >
              <div>
                <h1 className="text-sm">{card.title}</h1>
                <p className="text-xl font-medium mt-1">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium">Active Movies</p>
      <div className="relative flex flex-wrap gap-3 mt-4 max-w-5xl">
        {dashboardData.activeShows.map((show) => (
          <div
            key={show._id}
            className="w-55 rounded-sm overflow-hidden h-full pb-3 bg-yellow/10 border-yellow/20 hover:-translate-y-1 transition duration-300"
          >
            <img
              src={show.movie.poster_path}
              alt=""
              className="h-60 w-full object-cover"
            />
            <p className="font-medium p-2 truncate">{show.movie.title}</p>
            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium ">
                {currency} {show.showPrice}
              </p>
              <p className="flex items-center gap-1 text-sm text-white mt-1 pr-1">
                <StarIcon className="w-4 h-4 text-yellow fill-yellow" />
                {show.movie.vote_average.toFixed(1)}
              </p>
            </div>
            <div className="px-2 pt-2 text-sm text-white">
              {dateFormat(show.showDateTime)}
            </div>
          </div>
        ))}
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default DashBoard;
