import React, { useContext } from "react";
import {
  HomeIcon,
  LayoutDashboardIcon,
  ListIcon,
  PlusSquareIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { AppContent } from "../../context/AppContent";

const AdminSidebar = () => {
  const { userData } = useContext(AppContent);

  const adminNavlinks = [
    { name: "Home", path: "/", icon: HomeIcon, end: true },
    { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon, end: true },
    { name: "Users", path: "/admin/users", icon: UsersIcon },
    { name: "Add Movies", path: "/admin/add-movies", icon: PlusSquareIcon },
    { name: "List Movies", path: "/admin/list-movies", icon: ListIcon },
    { name: "List Booking", path: "/admin/list-bookings", icon: TicketIcon },
  ];

  const avatarText = userData?.avatar || userData?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <aside
      className="sticky top-0 h-screen w-16 shrink-0 bg-blue text-sm text-white shadow-sm sm:w-64"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-col items-center border-b border-white/15 px-3 py-6 sm:items-start sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-blue">
              {avatarText}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-base font-semibold">
                {userData ? userData.name : "Loading..."}
              </p>
              <p className="text-xs text-white/70">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 sm:px-3">
          {adminNavlinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              title={link.name}
              className={({ isActive }) =>
                [
                  "flex min-h-11 items-center justify-center gap-3 rounded-md px-3 transition sm:justify-start",
                  isActive
                    ? "bg-white text-blue-600"
                    : "text-white hover:bg-white/12",
                ].join(" ")
              }
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span className="hidden truncate font-medium sm:inline">
                {link.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
