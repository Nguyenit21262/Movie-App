import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatButton from "./components/ChatButton";
import ProtectedRoute from "./components/Protectedroute";

import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Theaters from "./pages/Theaters";
import TheatersDetail from "./pages/TheatersDetail";
import VideoPlay from "./components/VideoPlay";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";

import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddMovies from "./pages/admin/AddMovies";
import ListMovies from "./pages/admin/ListMovies";
import ListBooking from "./pages/admin/ListBooking";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

const App = () => {
  const location = useLocation();

  const hiddenLayoutRoutes = [
    "/login",
    "/register",
    "/email-verify",
    "/reset-password",
    // "/profile",
  ];

  const hideNavbarAndFooter =
    location.pathname.startsWith("/admin") ||
    hiddenLayoutRoutes.includes(location.pathname);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      {!hideNavbarAndFooter && (
        <>
          <Navbar />
          <ChatButton />
        </>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/tmdb/:id" element={<MovieDetails />} />
        <Route path="/theaters" element={<Theaters />} />

        <Route path="/theaters/tmdb/:id" element={<TheatersDetail />}>
          <Route path="trailer" element={<VideoPlay />} />
        </Route>

        <Route path="/theaters/:id" element={<TheatersDetail />}>
          <Route path="trailer" element={<VideoPlay />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/theaters/:id/:date" element={<SeatLayout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<DashBoard />} />
            <Route path="add-movies" element={<AddMovies />} />
            <Route path="list-movies" element={<ListMovies />} />
            <Route path="list-bookings" element={<ListBooking />} />
          </Route>
        </Route>
      </Routes>

      {!hideNavbarAndFooter && <Footer />}
    </>
  );
};

export default App;
