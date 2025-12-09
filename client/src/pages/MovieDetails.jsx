import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { useEffect } from "react";
import { ArrowRight, Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import DataSelect from "../components/DataSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const show = dummyShowsData.find((show) => show._id === id);
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData,
      });
    }
  };

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
            src={show.movie.backdrop_path || show.movie.poster_path}
            alt="Movie Background"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay - mờ dần từ trên xuống */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-black"></div>
          {/* Lớp overlay thêm độ mờ */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Nội dung thông tin phim */}
        <div className="relative z-10 px-8 md:px-16 lg:px-40 pt-30 md:pt-50">
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* hình ảnh bộ phim */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-yellow/30 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src={show.movie.poster_path}
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
              
              <h1 className="text-4xl md:text-5xl font-bold max-w-96 text-balance bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {show.movie.title}
              </h1>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                  <StarIcon className="w-5 h-5 text-yellow fill-yellow" />
                  <span className="font-medium">{show.movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{timeFormat(show.movie.runtime)}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{show.movie.release_date.split("-")[0]}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {show.movie.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full text-sm border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 mt-4 text-base leading-relaxed max-w-xl backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10">
                {show.movie.overview}
              </p>

              <div className="flex items-center flex-wrap gap-4 mt-6">
                <button
                  onClick={() => {
                    navigate(`/movie/${show.movie._id}/trailer`);
                    scrollTo(0, 0);
                  }}
                  className="flex items-center gap-3 px-7 py-3 text-sm bg-yellow hover:from-yellow-dark hover:to-yellow transition-all rounded-lg font-semibold cursor-pointer active:scale-95 shadow-lg shadow-yellow/20"
                >
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch Trailer
                </button>
                <a
                  href="#dataselect"
                  className="px-10 py-3 text-sm bg-primary hover:from-primary-dark hover:to-primary transition-all rounded-lg font-semibold cursor-pointer active:scale-95 shadow-lg shadow-primary/20"
                >
                  Buy Tickets
                </a>
                <button className="p-3 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 transition-all rounded-full cursor-pointer active:scale-95 shadow-lg border border-white/10">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần từ cast trở xuống có background đen */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-5 overflow-hidden">
        {/* các diễn viên */}
        <div className="max-w-6xl mx-auto">
          <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
          <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
            <div className="flex items-center gap-5 w-max px-4">
              {show.movie.casts.slice(0, 11).map((cast, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <img
                    src={cast.profile_path}
                    alt=""
                    className="rounded-full h-20 md:h-20 aspect-square object-cover"
                  />
                  <p className="font-medium text-xs mt-3">{cast.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DataSelect Component */}
        <div className="max-w-6xl mx-auto" id="dataselect">
          <DataSelect dateTime={show.dateTime} id={id} />
        </div>

        {/* You May Also Like Section */}
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center justify-between pt-20 pb-10">
            <p className="text-gray-300 font-medium text-lg">You May Also Like</p>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dummyShowsData.slice(0, 5).map((show) => (
              <MovieCard key={show._id} movie={show} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;