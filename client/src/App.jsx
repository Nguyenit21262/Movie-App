import React, { use } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/movies" element={<Movies />}></Route>
        <Route path="/movies/:id" element={<MovieDetails />}></Route>
        <Route path="/movies/:id/:date" element={<SeatLayout />}></Route>
        <Route path="/my-bookings" element={<MyBookings />}></Route>
        <Route path="/favorite" element={<Favorite />}></Route>
      </Routes>
      
      {!isAdminRoute &&<Footer/>}
    </>
  );
};

export default App;
