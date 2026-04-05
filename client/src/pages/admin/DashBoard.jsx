import React, { useEffect, useState, useMemo } from "react";
import {
  ChartLineIcon,
  CircleDollarSignIcon,
  PlayCircleIcon,
  UsersIcon,
  PencilIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import dateFormat from "../../lib/dateFormat.js";
import { getDashboardData as getDashboardDataRequest } from "../../api/adminApi";
import { deleteShow, updateShow } from "../../api/showApi";

const TMDB_POSTER = "https://image.tmdb.org/t/p/w92";

const DashBoard = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ showDateTime: "", showPrice: "" });
  const [saving, setSaving] = useState(false);
  const [expandedMovies, setExpandedMovies] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await getDashboardDataRequest();
        if (data.success) {
          setDashboardData(data.dashboardData);
        } else {
          toast.error(data.message || "Failed to load dashboard");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const groupedShows = useMemo(() => {
    const map = {};
    dashboardData.activeShows.forEach((show) => {
      const movieId = show.movie?._id;
      if (!movieId) return;
      if (!map[movieId]) {
        map[movieId] = { movie: show.movie, shows: [] };
      }
      map[movieId].shows.push(show);
    });
    return Object.values(map);
  }, [dashboardData.activeShows]);

  const toggleExpand = (movieId) => {
    setExpandedMovies((prev) => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  const handleDelete = async (showId) => {
    if (!window.confirm("Delete this show and all its bookings?")) return;
    try {
      const { data } = await deleteShow(showId);
      if (data.success) {
        toast.success("Show deleted");
        setDashboardData((prev) => ({
          ...prev,
          activeShows: prev.activeShows.filter((s) => s._id !== showId),
        }));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Failed to delete show");
    }
  };

  const startEdit = (show) => {
    setEditingId(show._id);
    setEditForm({
      showDateTime: new Date(show.showDateTime).toISOString().slice(0, 16),
      showPrice: show.showPrice ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ showDateTime: "", showPrice: "" });
  };

  const handleUpdate = async (showId) => {
    setSaving(true);
    try {
      const { data } = await updateShow(showId, {
        showDateTime: editForm.showDateTime,
        showPrice: Number(editForm.showPrice),
      });
      if (data.success) {
        toast.success("Show updated");
        setDashboardData((prev) => ({
          ...prev,
          activeShows: prev.activeShows.map((s) =>
            s._id === showId ? data.show : s,
          ),
        }));
        cancelEdit();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Failed to update show");
    } finally {
      setSaving(false);
    }
  };

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: ChartLineIcon,
      iconColor: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CircleDollarSignIcon,
      iconColor: "text-green-600",
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: PlayCircleIcon,
      iconColor: "text-purple-600",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UsersIcon,
      iconColor: "text-orange-600",
    },
  ];

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 ${card.bg} shadow-sm hover:shadow-md transition-shadow border border-gray-100 rounded-lg`}
          >
            <div>
              <p className="text-xs font-medium text-gray-700 opacity-90">
                {card.title}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {card.value}
              </p>
            </div>
            <div className={`p-2 rounded-full bg-white bg-opacity-30`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className=" mt-6 px-4 py-3 border-b bg-gray-50 rounded-lg flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800">Active Movies</h2>
      </div>

      <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-200">
                <th className="px-4 py-2 text-left font-semibold">Movie</th>
                <th className="px-4 py-2 text-left font-semibold">Showtimes</th>
                <th className="px-4 py-2 text-left font-semibold">Price</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {groupedShows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No active shows
                  </td>
                </tr>
              ) : (
                groupedShows.map(({ movie, shows }) => {
                  const isExpanded = expandedMovies?.[movie._id] ?? false;
                  const visibleShows = isExpanded ? shows : shows.slice(0, 2);
                  const hasMore = shows.length > 2;

                  return (
                    <tr
                      key={movie._id}
                      className="align-middle border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Movie */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              movie.poster_path
                                ? `${TMDB_POSTER}${movie.poster_path}`
                                : "/no-image.png"
                            }
                            className="w-10 h-14 object-cover rounded shadow-sm border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-900 text-xs">
                              {movie.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Showtimes */}
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1.5">
                          {visibleShows.map((show) => (
                            <div
                              key={show._id}
                              className="flex items-center min-h-[26px]"
                            >
                              {editingId === show._id ? (
                                <input
                                  type="datetime-local"
                                  value={editForm.showDateTime}
                                  onChange={(e) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      showDateTime: e.target.value,
                                    }))
                                  }
                                  className="border border-gray-300 px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 outline-none text-[11px] w-full max-w-[160px]"
                                />
                              ) : (
                                <span className="text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                  {dateFormat(show.showDateTime)}
                                </span>
                              )}
                            </div>
                          ))}

                          {hasMore && (
                            <button
                              onClick={() => toggleExpand(movie._id)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-1 hover:text-blue-800 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUpIcon className="w-3 h-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-3 h-3" />
                                  Show more
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1.5">
                          {visibleShows.map((show) => (
                            <div
                              key={show._id}
                              className="flex items-center min-h-[26px]"
                            >
                              {editingId === show._id ? (
                                <input
                                  type="number"
                                  value={editForm.showPrice}
                                  onChange={(e) =>
                                    setEditForm((p) => ({
                                      ...p,
                                      showPrice: e.target.value,
                                    }))
                                  }
                                  className="border border-gray-300 px-2 py-1 rounded focus:ring-1 focus:ring-blue-500 outline-none text-[11px] w-20"
                                />
                              ) : (
                                <span className="text-xs font-bold text-gray-900">
                                  {currency} {show.showPrice}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1.5">
                          {visibleShows.map((show) => (
                            <div
                              key={show._id}
                              className="flex gap-1.5 items-center min-h-[26px]"
                            >
                              {editingId === show._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(show._id)}
                                    disabled={saving}
                                    className="px-2 py-1 text-[11px] font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-2 py-1 text-[11px] font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(show)}
                                    className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    title="Edit"
                                  >
                                    <PencilIcon className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDelete(show._id)}
                                    className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2Icon className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DashBoard;
