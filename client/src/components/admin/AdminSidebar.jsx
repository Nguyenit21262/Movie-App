import React, { useContext } from "react";
import { FaHome, FaFilm } from "react-icons/fa";
import { MdDashboard, MdAddBox, MdList } from "react-icons/md";
import { BsTicketPerforated } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { AppContent } from "../../context/AppContent";

const AdminSidebar = () => {
  const { userData } = useContext(AppContent);

  const adminNavlinks = [
  { name: "Home", path: "/", icon: FaHome },
  { name: "Dashboard", path: "/admin", icon: MdDashboard },
  { name: "Add Movies", path: "/admin/add-movies", icon: MdAddBox },
  { name: "List Movies", path: "/admin/list-movies", icon: MdList },
  { name: "List Booking", path: "/admin/list-bookings", icon: BsTicketPerforated },
];
    

  return (
    <aside
      className="
    h-full
    w-14 md:w-60
    bg-blue
    rounded-lg
    text-sm
    flex flex-col
    items-center
    pt-8
  "
    >
      {/* USER */}
      <div className="h-9 md:h-14 w-9 md:w-14 rounded-full bg-white flex items-center justify-center text-blue font-bold text-lg">
        {userData?.avatar || "U"}
      </div>

      <p className="mt-2 text-base text-white max-md:hidden">
       {userData ? userData.name : " Loading..."}
      </p>

      {/* NAV LINKS */}
      <nav className="w-full mt-6">
        {adminNavlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `relative flex items-center
               max-md:justify-center gap-2
               w-full py-2.5 md:pl-10
               text-white
               ${isActive ? "bg-yellow/15 text-blue" : ""}
               transition`
            }
          >
            <link.icon className="w-5 h-5" />
            <p className="max-md:hidden">{link.name}</p>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
