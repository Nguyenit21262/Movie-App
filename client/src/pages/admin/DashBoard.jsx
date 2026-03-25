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
      bg: "bg-blue-400",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `${currency} ${dashboardData.totalRevenue.toLocaleString()}`,
      icon: CircleDollarSignIcon,
      bg: "bg-green-400",
      iconColor: "text-green-600",
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: PlayCircleIcon,
      bg: "bg-purple-400",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser,
      icon: UsersIcon,
      bg: "bg-orange-400",
      iconColor: "text-orange-600",
    },
  ];

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="Admin" text2="Dashboard" />

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-4 py-3 ${card.bg} border border-gray-200 rounded-md`}
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

      <div className="mt-8 border border-gray-200 rounded-md bg-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-base font-semibold text-gray-800">
            Active Movies
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-gray-600">
                <th className="px-4 py-2 text-left font-medium">Movie</th>
                <th className="px-4 py-2 text-left font-medium">Showtimes</th>
                <th className="px-4 py-2 text-left font-medium">Price</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
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
                    <tr key={movie._id} className="align-top">
                      {/* Movie */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              movie.poster_path
                                ? `${TMDB_POSTER}${movie.poster_path}`
                                : "/no-image.png"
                            }
                            className="w-12 h-16 object-cover rounded border"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {movie.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Showtimes */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {visibleShows.map((show) => (
                            <div key={show._id}>
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
                                  className="border px-2 py-1 rounded text-xs"
                                />
                              ) : (
                                <span className="text-xs text-gray-700">
                                  {dateFormat(show.showDateTime)}
                                </span>
                              )}
                            </div>
                          ))}

                          {hasMore && (
                            <button
                              onClick={() => toggleExpand(movie._id)}
                              className="flex items-center gap-1 text-xs text-blue-600 mt-1 hover:text-blue-700"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUpIcon className="w-3.5 h-3.5" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDownIcon className="w-3.5 h-3.5" />Show more
                                  
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {visibleShows.map((show) => (
                            <div key={show._id}>
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
                                  className="border px-2 py-1 rounded w-20 text-xs"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-800">
                                  {currency} {show.showPrice}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {visibleShows.map((show) => (
                            <div key={show._id} className="flex gap-1">
                              {editingId === show._id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(show._id)}
                                    disabled={saving}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(show)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    <PencilIcon className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDelete(show._id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
