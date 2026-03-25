import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import { assets } from "../assets/assets";
import { SearchIcon, ChevronDown } from "lucide-react";
import { getGenresArray } from "../lib/tmdb/Genres";
import NotificationBell from "../components/NotificationBell";
import { getMovieSuggestions } from "../api/movieApi";

const SearchBar = memo(({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef(null);

  const fetchSuggestions = async (q) => {
    try {
      const { data } = await getMovieSuggestions(q);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Suggestion error:", err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
    setSuggestions([]);
  };

  return (
    <div className="hidden md:block max-w-md relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            value={query}
            onChange={handleChange}
            placeholder="Search movies..."
            className="w-full px-8 py-2 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-white-off rounded-md"
          />
          <button type="submit" className="absolute right-3 top-2.5">
            <SearchIcon className="h-5 w-5 text-gray-400 hover:text-white transition" />
          </button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50">
          {suggestions.map((title, i) => (
            <div
              key={i}
              onClick={() => {
                setQuery(title);
                setSuggestions([]);
                onSearch(title);
              }}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white cursor-pointer"
            >
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const GenreDropdown = memo(() => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const genres = useMemo(() => getGenresArray(), []);

  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-gray-300 hover:text-white transition"
      >
        Genres
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute top-full mt-2 left-0 w-[480px] bg-neutral-900 rounded-lg shadow-2xl border border-neutral-700 z-50 max-h-96 overflow-y-auto">
            <div
              onClick={() => {
                navigate("/movies");
                close();
                window.scrollTo(0, 0);
              }}
              className="px-4 py-3 hover:bg-neutral-800 cursor-pointer text-white font-medium border-b border-neutral-700"
            >
              All Genres
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1 p-2">
              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    navigate(`/movies?genre=${g.name}`);
                    close();
                    window.scrollTo(0, 0);
                  }}
                  className="px-3 py-2 rounded-md hover:bg-neutral-800 cursor-pointer text-gray-300 hover:text-white text-sm"
                >
                  {g.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

const NavLinks = memo(() => (
  <div className="hidden md:flex space-x-8">
    <Link
      to="/movies"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="text-gray-300 hover:text-white transition"
    >
      Movies
    </Link>

    <Link
      to="/theaters"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="text-gray-300 hover:text-white transition"
    >
      Theaters
    </Link>

    <GenreDropdown />
  </div>
));

const UserMenu = memo(({ userData, onLogout, onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-9 rounded-full border border-white/20 cursor-pointer bg-pink-600 flex items-center justify-center text-white font-semibold text-sm uppercase"
      >
        {userData?.name?.charAt(0) || "U"}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {userData?.role === "admin" ? (
            <div className="absolute right-0 z-50 w-48 bg-white rounded-lg shadow-xl overflow-hidden">
              <div
                onClick={() => {
                  onNavigate("/admin");
                  setOpen(false);
                }}
                className="px-4 py-2.5 text-sm text-black hover:bg-gray-50 cursor-pointer"
              >
                Dashboard
              </div>

              {/* <div
                onClick={onLogout}
                className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Logout
              </div> */}
            </div>
          ) : (
            <div className="absolute right-0 z-50 w-48 bg-white rounded-lg shadow-xl overflow-hidden">
              <ul>
                <li
                  onClick={() => {
                    onNavigate("/profile");
                    setOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm text-black hover:bg-gray-50 cursor-pointer"
                >
                  Profile
                </li>

                <li
                  onClick={() => {
                    onNavigate("/my-bookings");
                    setOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm text-black hover:bg-gray-50 cursor-pointer"
                >
                  My Bookings
                </li>

                <li
                  onClick={onLogout}
                  className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
});

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, isLoggedIn, logoutUser } = useContext(AppContent);

  const [scrolled, setScrolled] = useState(false);
  const prevScroll = useRef(false);

  React.useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 10;
      if (prevScroll.current !== next) {
        prevScroll.current = next;
        setScrolled(next);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  }, [logoutUser, navigate]);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "backdrop-blur-lg bg-black/80" : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={assets.logo} alt="Logo" className="h-8 sm:h-10" />
            </Link>

            <SearchBar
              onSearch={(q) =>
                navigate(`/movies?search=${encodeURIComponent(q)}`)
              }
            />

            <NavLinks />
          </div>

          <div className="flex items-center space-x-3">
            {isLoggedIn && userData && <NotificationBell />}

            {isLoggedIn && userData ? (
              <UserMenu
                userData={userData}
                onLogout={logout}
                onNavigate={(path) => navigate(path)}
              />
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition"
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
