import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, X } from "lucide-react";
import { AppContent } from "../context/AppContent";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationApi";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContent);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const isAdmin = userData?.role === "admin";

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await getNotifications();

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    }
  }, []);

  useEffect(() => {
    const runFetch = () => {
      void fetchNotifications();
    };

    const timeout = setTimeout(runFetch, 0);
    const interval = setInterval(runFetch, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);

    if (!open && unreadCount > 0) {
      try {
        await markAllNotificationsRead();

        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Mark all read failed:", err);
      }
    }
  };

  const handleClickNotif = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationRead(notif._id);

        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error("Mark one read failed:", err);
    }

    setOpen(false);
    navigate(isAdmin ? "/admin/list-bookings" : "/my-bookings");
  };

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();

    try {
      setDeletingId(notificationId);
      await deleteNotification(notificationId);

      setNotifications((prev) => {
        const target = prev.find((notification) => notification._id === notificationId);
        if (target && !target.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }

        return prev.filter((notification) => notification._id !== notificationId);
      });
    } catch (error) {
      console.error("Delete notification failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      setDeletingAll(true);
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Delete all notifications failed:", error);
    } finally {
      setDeletingAll(false);
    }
  };

  const formatTime = (date) => {
    const diff = currentTime - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const typeColor = {
    booking_created: "bg-blue-400",
    booking_paid: "bg-emerald-400",
    booking_cancelled: "bg-red-400",
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleDeleteAllNotifications}
                    disabled={deletingAll}
                    className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleClickNotif(notif)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                      !notif.isRead ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          typeColor[notif.type] || "bg-gray-400"
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm font-medium truncate ${
                              !notif.isRead ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-600 shrink-0">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      <button
                        onClick={(event) =>
                          handleDeleteNotification(event, notif._id)
                        }
                        disabled={deletingId === notif._id}
                        className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10">
                <button
                  onClick={() => {
                    navigate(isAdmin ? "/admin/list-bookings" : "/my-bookings");
                    setOpen(false);
                  }}
                  className="w-full text-xs text-center text-white hover:text-blue-400 font-medium transition-colors"
                >
                  View all bookings
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
