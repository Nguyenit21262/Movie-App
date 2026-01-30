import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";
import { SearchIcon } from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const { userData, isLoggedIn, backendUrl, setIsLoggedIn, setUserData } =
    useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-lg border-b border-gray-800/50"
          : "border-b border-gray-800"
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center space-x-8">
            <Link to="/" onClick={() => scrollTo(0, 0)}>
              <img src={assets.logo} alt="Logo" className="h-8 sm:h-10" />
            </Link>

            <div className="hidden md:block max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-8 py-2 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="hidden md:flex space-x-8">
              <Link to="/movies" className="text-gray-300 hover:text-white">
                Movies
              </Link>
              <Link to="/theaters" className="text-gray-300 hover:text-white">
                Theaters
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            {isLoggedIn && userData ? (
              <div className="relative group">
                <div className="pb-2">
                  <div className="h-9 w-9 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold cursor-pointer">
                    {userData.name[0].toUpperCase()}
                  </div>
                </div>

                <div className="absolute hidden group-hover:block right-0 w-48 bg-white rounded-lg shadow-xl overflow-hidden">
                  <ul>
                    <li
                      onClick={() => navigate("/profile")}
                      className="px-4 py-2.5 text-sm text-black hover:bg-gray-50 cursor-pointer"
                    >
                      Profile
                    </li>

                    <li
                      onClick={() => navigate("/my-bookings")}
                      className="px-4 py-2.5 text-sm text-black hover:bg-gray-50 cursor-pointer"
                    >
                      My Bookings
                    </li>

                    <li
                      onClick={logout}
                      className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-yellow"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
