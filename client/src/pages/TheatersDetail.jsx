import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DataSelect from "../components/DataSelect";
import TheatersCard from "../components/TheatersCard";
import Loading from "../components/Loading";

const TheatersDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hash } = useLocation(); // Lấy phần #booking-section từ URL
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const foundShow = dummyShowsData.find((s) => s._id === id);
    if (foundShow) {
      setShow({ theaters: foundShow, dateTime: dummyDateTimeData });
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const element = document.getElementById(hash.replace("#", ""));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, show]);

  return show ? (
    <div className="min-h-screen bg-black">
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <img
            src={show.theaters.backdrop_path || show.theaters.poster_path}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 px-8 md:px-16 lg:px-40 pt-30 md:pt-50">
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            <div className="relative group">
              <img
                src={show.theaters.poster_path}
                alt=""
                className="max-md:mx-auto rounded-xl h-[460px] max-w-[280px] object-cover relative shadow-2xl border border-white/10"
              />
            </div>

            <div className="relative flex flex-col gap-3">
              <div className="inline-flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  English
                </span>
                <span className="px-3 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full text-sm border border-yellow-500/30">
                  HD
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-balance bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {show.theaters.title}
              </h1>

              <div className="flex flex-col gap-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{timeFormat(show.theaters.runtime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{show.theaters.release_date.split("-")[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span>
                    {show.theaters.genres.map((g) => g.name).join(", ")}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Description
                </h3>
                <p className="text-gray-400 leading-relaxed max-w-2xl">
                  {show.theaters.overview}
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => navigate("trailer")}
                  className="flex items-center gap-3 px-8 py-3 bg-white/10 hover:bg-white/20 transition-all font-semibold rounded-xl border border-white/10 active:scale-95"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </button>
                <button className="p-3 bg-gray-800 hover:bg-gray-700 transition-all rounded-full border border-white/10">
                  <Heart className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 mt-10">
        <div id="booking-section" className="max-w-6xl mx-auto">
          <DataSelect dateTime={show.dateTime} id={id} />
        </div>

        <div className="max-w-6xl mx-auto pb-20">
          <div className="flex items-center justify-between pt-20 pb-10">
            <p className="text-white font-medium text-lg">You May Also Like</p>
            <button
              onClick={() => {
                navigate("/theaters"), scrollTo(0, 0);
              }}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {dummyShowsData.slice(0, 4).map((item) => (
              <TheatersCard
                theater={item}
                key={item._id}
                onClick={() => {
                  navigate(`/theaters/${item._id}`);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Outlet context={{ showData: show.theaters }} />
    </div>
  ) : (
    <Loading />
  );
};

export default TheatersDetail;
