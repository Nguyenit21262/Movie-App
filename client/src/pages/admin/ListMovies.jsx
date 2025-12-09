import React, { useEffect } from "react";
import { useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
// list các movie đã được book
const ListMovies = () => {
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "USER_1",
            B1: "USER_2",
            C1: "USER_3",
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllShows();
  }, []);
  return !loading ? (<div>
    <Title text1 = "List" text2="Show"/>
  </div>): <Loading/>;
};

export default ListMovies;
