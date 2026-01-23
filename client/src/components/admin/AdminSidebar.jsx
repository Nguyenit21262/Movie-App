import React from "react";
import { assets } from "../../assets/assets";
import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Add Movies", path: "/admin/add-movies", icon: PlusSquareIcon },
    { name: "List Movies", path: "/admin/list-movies", icon: ListIcon },
    {
      name: "List Booking",
      path: "/admin/list-bookings",
      icon: ListCollapseIcon,
    },
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
      <img
        className="h-9 md:h-14 w-9 md:w-14 rounded-full"
        src={user.imageUrl}
        alt="sidebar"
      />

      <p className="mt-2 text-base text-white max-md:hidden">
        {user.firstName} {user.lastName}
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
