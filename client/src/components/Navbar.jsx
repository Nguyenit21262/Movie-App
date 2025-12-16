import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import {
  MenuIcon,
  SearchIcon,
  TicketPlus,
  User,
  XIcon,
  Globe,
} from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const languages = [
    { code: "en", name: "English" },
    { code: "vi", name: "Vietnamese" },
  ];

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
          {/* Logo + Thanh tìm kiếm (desktop) + Menu (desktop) */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="shrink-0">
              <Link to="/">
                <img
                  src={assets.logo}
                  alt="Logo"
                  className="h-8 w-auto sm:h-10"
                  onClick={() => scrollTo(0, 0)}
                />
              </Link>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="hidden md:block flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-8 py-2 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                <SearchIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/movies"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => scrollTo(0, 0)}
              >
                Movies
              </Link>
              <Link
                to="/theaters"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => scrollTo(0, 0)}
              >
                Theaters
              </Link>
              {/* <Link
                to="/favorite"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => scrollTo(0, 0)}
              >
                Favorite
              </Link> */}
            </div>
          </div>

          {/* Bên phải: Nút chuyển ngữ, User/Avatar, Mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Nút chuyển ngữ */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center text-gray-300 hover:text-white focus:outline-none"
              >
                <Globe className="h-5 w-5" />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => {
                          // Xử lý chuyển ngữ ở đây
                          setIsLangOpen(false);
                        }}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User/Avatar hoặc Login Button */}
            {!user ? (
              <button
                onClick={openSignIn}
                className="px-4 py-2  text-gray-300 hover:text-white font-medium rounded-full transition-colors whitespace-nowrap"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center">
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="My Bookings"
                      labelIcon={<TicketPlus width={15} />}
                      onClick={() => navigate("/my-bookings")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}

            {/* Mobile menu button (chỉ hiện trên mobile) */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-gray-900 z-40 pt-16">
          <div className="px-4">
            {/* Thanh tìm kiếm trong mobile menu */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <SearchIcon className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Menu links trong mobile */}
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white text-lg py-2 transition-colors"
                onClick={() => {
                  scrollTo(0, 0);
                  setIsMenuOpen(false);
                }}
              >
                Home
              </Link>
              <Link
                to="/movies"
                className="text-gray-300 hover:text-white text-lg py-2 transition-colors"
                onClick={() => {
                  scrollTo(0, 0);
                  setIsMenuOpen(false);
                }}
              >
                Movies
              </Link>
              <Link
                to="#"
                className="text-gray-300 hover:text-white text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Theaters
              </Link>
              <Link
                to="/favorite"
                className="text-gray-300 hover:text-white text-lg py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Favorite
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Đóng dropdown ngôn ngữ khi click ra ngoài */}
      {isLangOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsLangOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
