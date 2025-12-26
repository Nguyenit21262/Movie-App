import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatButton from "./components/ChatButton";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Theaters from "./pages/Theaters";
import TheatersDetail from "./pages/TheatersDetail";
import VideoPlay from "./components/VideoPlay";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddMovies from "./pages/admin/AddMovies";
import ListMovies from "./pages/admin/ListMovies";
import ListBooking from "./pages/admin/ListBooking";
import Login from "./pages/Login";
import Register from "./pages/Resigter";
const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const isLoginRoute = useLocation().pathname === "/login";
   const isRegisterRoute = useLocation().pathname === "/register";
  return (
    <>
      <Toaster />
      {!isAdminRoute && !isLoginRoute && !isRegisterRoute && (
        <>
          <Navbar />
          <ChatButton />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/theaters" element={<Theaters />} />

        <Route path="/theaters/:id" element={<TheatersDetail />}>
          <Route path="trailer" element={<VideoPlay />} />
        </Route>

        <Route path="/theaters/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />

        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-movies" element={<AddMovies />} />
          <Route path="list-movies" element={<ListMovies />} />
          <Route path="list-bookings" element={<ListBooking />} />
        </Route>
      </Routes>
      {!isAdminRoute && !isLoginRoute && !isRegisterRoute && <Footer />}
    </>
  );
};

export default App;
