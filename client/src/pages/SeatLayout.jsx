import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";
import { createBooking, getOccupiedSeats } from "../api/bookingApi";
import { getShowMovieById } from "../api/showApi";

const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];

  const { id, date } = useParams();
  const [searchParams] = useSearchParams();
  const showId = searchParams.get("showId");

  const navigate = useNavigate();
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [movieInfo, setMovieInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!showId) return;

    const fetchData = async () => {
      try {
        const [showRes, seatsRes] = await Promise.all([
          getShowMovieById(id),
          getOccupiedSeats(showId),
        ]);

        if (showRes.data.success) {
          setMovieInfo(showRes.data.movie);

          const allShows = Object.values(showRes.data.dateTime).flat();
          const current = allShows.find((s) => s.showId === showId);
          setShowInfo(current);
        }

        if (seatsRes.data.success) {
          setOccupiedSeats(seatsRes.data.occupiedSeats);
        }
      } catch (error) {
        console.error("Error fetching seat data:", error);
        toast("Failed to load seat information", {
          style: {
            background: "#000",
            color: "#fff",
            fontWeight: "600",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId, id]);

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      toast("You can only select up to 5 seats", {
        style: {
          background: "#000",
          color: "#fff",
          fontWeight: "600",
        },
      });
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId],
    );
  };

  const handleBooking = async () => {
    if (!selectedSeats.length) {
      toast("Please select at least one seat", {
        style: {
          background: "#000",
          color: "#fff",
          fontWeight: "600",
        },
      });
      return;
    }

    setBooking(true);

    const loadingToast = toast.loading("Booking your seats...", {
      style: {
        background: "#000",
        color: "#fff",
        fontWeight: "600",
      },
    });

    try {
      const { data } = await createBooking({ showId, selectedSeats });

      toast.dismiss(loadingToast);

      if (data.success) {
        toast("Booking completed successfully", {
          style: {
            background: "#000",
            color: "#fff",
            fontWeight: "600",
          },
        });

        navigate("/my-bookings");
        window.scrollTo(0, 0);
      } else {
        toast(data.message || "Booking failed. Please try again.", {
          style: {
            background: "#000",
            color: "#fff",
            fontWeight: "600",
          },
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      toast(
        error.response?.data?.message || "Booking failed. Please try again.",
        {
          style: {
            background: "#000",
            color: "#fff",
            fontWeight: "600",
          },
        },
      );
    } finally {
      setBooking(false);
    }
  };

  const handleProceed = () => {
    if (!selectedSeats.length) {
      toast("Please select at least one seat", {
        style: {
          background: "#000",
          color: "#fff",
          fontWeight: "600",
        },
      });
      return;
    }

    toast("Processing your booking...", {
      style: {
        background: "#000",
        color: "#fff",
        fontWeight: "600",
      },
    });

    handleBooking();
  };

  const renderSeats = (row, count = 0) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isOccupied = occupiedSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);

          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isOccupied}
              className={`h-8 w-8 rounded border text-xs font-medium transition-all duration-150
                ${
                  isOccupied
                    ? "bg-blue  text-black cursor-not-allowed"
                    : isSelected
                      ? "bg-yellow-400 border-yellow-400 text-black scale-110 shadow-lg shadow-yellow-400/30"
                      : "bg-white/5 border-white/20 text-white hover:bg-white/15 hover:border-white/40 cursor-pointer"
                }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {movieInfo?.backdrop_path && (
        <div className="fixed inset-0 z-0">
          <img
            src={`${TMDB_BACKDROP}${movieInfo.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="flex-1 flex flex-col items-center px-6 pt-24 pb-16">
          {movieInfo && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white">
                {movieInfo.title}
              </h2>
              <p className="text-white text-sm mt-1 font-medium">
                {date} •{" "}
                {showInfo
                  ? new Date(showInfo.time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </div>
          )}

          <h1 className="text-2xl font-semibold mb-4 text-white">
            Select your seat
          </h1>

          <p className="text-white text-sm mb-6 font-medium">Screen Side</p>

          <div className="w-full max-w-2xl mb-6">
            <img src={assets.screenImage} alt="screen" className="w-full" />
          </div>

          <div className="flex items-center gap-6 mb-6 text-sm text-white font-medium">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border border-white/20 bg-white/5" />
              Available
            </div>

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-yellow-400" />
              Selected
            </div>

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-blue" />
              Occupied
            </div>
          </div>

          <div className="flex flex-col items-center text-sm text-white font-medium">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
              {groupRows[0].map((row) => renderSeats(row, 10))}
            </div>

            <div className="grid grid-cols-2 gap-11">
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx}>{group.map((row) => renderSeats(row, 8))}</div>
              ))}
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={!selectedSeats.length || booking}
            className="mt-12 flex items-center gap-2 px-10 py-3 text-sm rounded-full font-semibold transition-all active:scale-95
              bg-yellow-400 hover:bg-yellow-300 text-black
              disabled:bg-white/10 disabled:text-white disabled:cursor-not-allowed"
          >
            {booking ? "Processing..." : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
