import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import {  dummyShowsData,dummyDateTimeData } from "../assets/assets";
import ReactPlayer from "react-player";
import Loading from "./Loading";

const TrailersSection = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  // const [currentTrailer, setCurrentTrailer] = useState([]);

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
    <div
      id="trailer"
      className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden"
    >
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        Trailers
      </p>

      <div className="relative mt-6 ">
        <ReactPlayer
          src={show.movie.videoUrl}
          controls
          className="mx-auto max-w-full"
          width="960px"
          height="540px"
        />
      </div>
    </div>
  ): <Loading/>;
};

export default TrailersSection;
