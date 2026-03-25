import React, { useContext } from "react";
import { SearchIcon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { AppContent } from "../../context/AppContent";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logoutUser } = useContext(AppContent);

  return (
    <header
      className="
        h-16
        bg-white
        rounded-lg
        px-6 md:px-10
        flex items-center justify-between
        shadow-sm
      "
    >
      {/* Search box */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md w-48 md:w-64">
        <SearchIcon className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-black w-full"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <button
          onClick={async () => {
            await logoutUser();
            navigate("/login");
            scrollTo(0, 0);
          }}
          className="
            flex items-center gap-2
            text-sm text-red-600
            hover:bg-red-50
            px-3 py-2 rounded-md
            transition duration-200
          "
        >
          <LogOutIcon className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
