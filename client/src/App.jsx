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
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddMovies from "./pages/admin/AddMovies";
import ListMovies from "./pages/admin/ListMovies";
import ListBooking from "./pages/admin/ListBooking";
import Theaters from "./pages/Theaters";
import TheatersDetail from "./pages/TheatersDetail"


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
        <Route path="/theaters" element={<Theaters />}></Route>
        <Route path="/theaters/:id" element={<TheatersDetail/>}/>
        <Route path="/movies/:id/:date" element={<SeatLayout />}></Route>
        <Route path="/my-bookings" element={<MyBookings />}></Route>
        <Route path="/favorite" element={<Favorite />}></Route>

        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-movies" element={<AddMovies />} />
          <Route path="list-movies" element={<ListMovies />} />
          <Route path = "list-bookings" element={<ListBooking/>}/>
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
