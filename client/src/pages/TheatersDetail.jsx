import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { useEffect } from "react";
import {
  ArrowRight,
  Heart,
  PlayCircleIcon,
  StarIcon,
  Clock,
  Calendar,
  Tag,
} from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DataSelect from "../components/DataSelect";
import TheatersCard from "../components/TheatersCard";
import Loading from "../components/Loading";
import VideoPlay from "../components/VideoPlay";

const TheatersDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow({
        theaters: show,
        dateTime: dummyDateTimeData,
      });
    }
  };

  const [isVideoPlayOpen, setIsVideoPlayOpen] = useState(false);

  // Hàm mở modal
  const openVideoPlay = () => setIsVideoPlayOpen(true);

  // Hàm đóng modal (sẽ truyền xuống VideoPlay)
  const closeVideoPlay = () => setIsVideoPlayOpen(false);

  useEffect(() => {
    getShow();
  }, [id]);

  return show ? (
    <div className="min-h-screen bg-black">
      {/* Phần thông tin phim có background */}
      <div className="relative">
        {/* Background chỉ cho phần này */}
        <div className="absolute inset-0 z-0">
          <img
            src={show.theaters.backdrop_path || show.theaters.poster_path}
            alt="Theaters Background"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - mờ dần từ trên xuống */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          {/* Lớp overlay thêm độ mờ */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Nội dung thông tin phim */}
        <div className="relative z-10 px-8 md:px-16 lg:px-40 pt-30 md:pt-50">
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* hình ảnh bộ phim */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow/30 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src={show.theaters.poster_path}
                alt=""
                className="max-md:mx-auto rounded-xl h-115 max-w-70 object-cover relative shadow-2xl"
              />
            </div>

            <div className="relative flex flex-col gap-3">
              <div className="inline-flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                  English
                </span>
                <span className="px-3 py-1 bg-yellow/20 backdrop-blur-sm rounded-full text-sm border border-yellow/30">
                  HD
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold max-w-96 text-balance bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {show.theaters.title}
              </h1>

              {/* Runtime */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{timeFormat(show.theaters.runtime)}</span>
              </div>

              {/* Release Year */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{show.theaters.release_date.split("-")[0]}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span>
                  {show.theaters.genres.map((g) => g.name).join(", ")}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-3xl font-semibold mb-2"> Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  {show.theaters.overview}
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-4 mt-6">
                <button
                  onClick={openVideoPlay}
                  className="flex items-center gap-3 px-7 py-3 text-sm  hover:from-yellow-dark hover:to-yellow transition-all font-semibold cursor-pointer active:scale-95 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </button>
                {isVideoPlayOpen && (
                  <VideoPlay
                    showData={show.theaters}
                    onClose={closeVideoPlay}
                  />
                )}
                {/* <a
                  href="#dataselect"
                  className="px-10 py-3 text-sm bg-primary hover:from-primary-dark hover:to-primary transition-all rounded-lg font-semibold cursor-pointer active:scale-95 shadow-lg shadow-primary/20"
                >
                  Buy Tickets
                </a> */}
                <button className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all rounded-full cursor-pointer active:scale-95 shadow-lg border border-white/10">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  background đen */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-5 overflow-hidden">
        {/* DataSelect Component */}
        <div className="max-w-6xl mx-auto" id="dataselect">
          <DataSelect dateTime={show.dateTime} id={id} />
        </div>

        {/* You May Also Like Section */}
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center justify-between pt-20 pb-10">
            <p className="text-gray-300 font-medium text-lg">
              You May Also Like
            </p>
            <button
              onClick={() => {
                navigate("/movies");
                scrollTo(0, 0);
              }}
              className="group flex items-center gap-2 text-sm text-gray-300"
            >
              View All{" "}
              <ArrowRight className="group-hover:translate-x-0.5 transition w-4.5 h-4.5" />
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3 mb-8">
            {/* Vẫn dùng dummyShowsData và sử dụng component TheatersCard đã sửa */}
            {dummyShowsData.slice(0, 4).map((theater) => (
              <TheatersCard theater={theater} key={theater._id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default TheatersDetail;
