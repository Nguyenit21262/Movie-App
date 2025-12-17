import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { useEffect } from "react";
import { ArrowRight, Heart, PlayCircleIcon, StarIcon, Tag } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import TrailersSection from "../components/TrailersSection";
import MovieReview from "../components/MovieReview";

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
    <div className=" bg-black">
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
        <div className="relative z-10 px-8 md:px-16 lg:px-36 pt-24 md:pt-36 lg:pt-44">
          <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
            {/* hình ảnh bộ phim */}
            <div className="relative group">
              <img
                src={show.movie.poster_path}
                alt=""
                className="max-md:mx-auto rounded-xl h-[440px] w-[300px] object-cover shadow-2xl"
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
                  <span className="font-medium">
                    {show.movie.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  {timeFormat(show.movie.runtime)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  {show.movie.release_date.split("-")[0]}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span>{show.movie.genres.map((g) => g.name).join(", ")}</span>
              </div>

              <p className="text-gray-300 mt-6 text-[15px] md:text-base leading-7 max-w-2xl ">
                {show.movie.overview}
              </p>

              <div className="flex items-center flex-wrap gap-4 mt-6">
                <a
                  href="#trailer"
                  className="flex items-center gap-3 px-7 py-3 text-sm bg-yellow hover:from-yellow-dark hover:to-yellow transition-all rounded-lg font-semibold cursor-pointer active:scale-95 shadow-lg shadow-yellow/20"
                >
                  {" "}
                  <PlayCircleIcon className="w-5 h-5" />
                  Play Movie
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
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-2 overflow-hidden">
        {/* các diễn viên */}
        <div className="max-w-6xl mx-auto">
          <p className="text-lg font-semibold mt-24 mb-2">Cast</p>
          <div className="overflow-x-auto scrollbar-none mt-6 pb-6">
            <div className="flex items-center gap-5 w-max px-4">
              {show.movie.casts.slice(0, 11).map((cast, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
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

        <TrailersSection />

        {/* You May Also Like Section */}
        <div className="max-w-6xl mx-auto mb-10">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-center">
            {dummyShowsData.slice(0, 5).map((show) => (
              <MovieCard
                key={show._id}
                movie={show}
                onClick={() => {
                  navigate(`/movies/${show._id}`);
                  scrollTo(0, 0);
                }}
              />
            ))}
          </div>
        </div>

        <MovieReview />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;
