import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  MessageSquareTextIcon,
  SearchIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import Title from "../../components/admin/Title.jsx";
import {
  deleteAdminChat,
  getAdminChats,
  getAdminChatUsers,
  updateAdminChatVisibility,
} from "../../api/adminApi";

const providerOptions = [
  { value: "", label: "All providers" },
  { value: "external-movie-ai", label: "External Movie AI" },
  { value: "openai-compatible", label: "OpenAI compatible" },
  { value: "fallback", label: "Fallback" },
];

const hiddenOptions = [
  { value: "visible", label: "Visible" },
  { value: "all", label: "All chats" },
  { value: "hidden", label: "Hidden only" },
];

const formatDateTime = (value) => {
  if (!value) return "No activity";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProviderLabel = (provider = "fallback") =>
  providerOptions.find((item) => item.value === provider)?.label || provider;

const UserActivity = () => {
  const [filters, setFilters] = useState({
    search: "",
    provider: "",
    date: "",
    hidden: "visible",
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [chats, setChats] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [updatingChatId, setUpdatingChatId] = useState("");

  const selectedUser = useMemo(
    () => users.find((item) => item.user?._id === selectedUserId)?.user || null,
    [selectedUserId, users],
  );

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await getAdminChatUsers({
        search: filters.search,
        provider: filters.provider || undefined,
        from: filters.date || undefined,
        to: filters.date || undefined,
        hidden: filters.hidden,
      });

      if (data.success) {
        setUsers(data.users);
        setSelectedUserId((current) => {
          if (current && data.users.some((item) => item.user?._id === current)) {
            return current;
          }
          return data.users[0]?.user?._id || "";
        });
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [filters]);

  const loadChats = useCallback(async () => {
    if (!selectedUserId) {
      setChats([]);
      setPagination({ page: 1, total: 0, totalPages: 1 });
      return;
    }

    setLoadingChats(true);
    try {
      const { data } = await getAdminChats({
        userId: selectedUserId,
        provider: filters.provider || undefined,
        from: filters.date || undefined,
        to: filters.date || undefined,
        hidden: filters.hidden,
        page: pagination.page,
        limit: 50,
      });

      if (data.success) {
        setChats(data.chats);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to load chats");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, [
    filters.date,
    filters.hidden,
    filters.provider,
    pagination.page,
    selectedUserId,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPagination((current) => ({ ...current, page: 1 }));
  }, [filters.date, filters.hidden, filters.provider, selectedUserId]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleToggleHidden = async (chat) => {
    setUpdatingChatId(chat._id);
    try {
      const { data } = await updateAdminChatVisibility(chat._id, {
        isHidden: !chat.isHidden,
      });

      if (data.success) {
        const shouldRemoveFromCurrentView =
          (filters.hidden === "visible" && data.chat.isHidden) ||
          (filters.hidden === "hidden" && !data.chat.isHidden);

        setChats((current) => {
          if (shouldRemoveFromCurrentView) {
            return current.filter((item) => item._id !== chat._id);
          }
          return current.map((item) => (item._id === chat._id ? data.chat : item));
        });
        if (shouldRemoveFromCurrentView) {
          setPagination((current) => ({
            ...current,
            total: Math.max(current.total - 1, 0),
          }));
        }
        toast.success(data.chat.isHidden ? "Chat hidden" : "Chat restored");
        loadUsers();
      } else {
        toast.error(data.message || "Failed to update chat");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update chat");
    } finally {
      setUpdatingChatId("");
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat permanently?")) return;

    setUpdatingChatId(chatId);
    try {
      const { data } = await deleteAdminChat(chatId);

      if (data.success) {
        setChats((current) => current.filter((chat) => chat._id !== chatId));
        setPagination((current) => ({
          ...current,
          total: Math.max(current.total - 1, 0),
        }));
        toast.success("Chat deleted");
        loadUsers();
      } else {
        toast.error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chat");
    } finally {
      setUpdatingChatId("");
    }
  };

  return (
    <div className="text-gray-900">
      <Title text1="User" text2="Activity" />

      <div className="mt-5 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-gray-200 px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search user"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <select
          value={filters.provider}
          onChange={(event) => updateFilter("provider", event.target.value)}
          className="min-h-11 rounded-md border border-gray-200 px-3 text-sm outline-none"
        >
          {providerOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="flex min-h-11 items-center gap-3 rounded-md border border-gray-200 px-3">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Date
          </span>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => updateFilter("date", event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>

        <select
          value={filters.hidden}
          onChange={(event) => updateFilter("hidden", event.target.value)}
          className="min-h-11 rounded-md border border-gray-200 px-3 text-sm outline-none"
        >
          {hiddenOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid min-h-[620px] gap-5 lg:grid-cols-[340px_1fr]">
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Chatbot users
            </p>
            <p className="text-xs text-gray-500">{users.length} users found</p>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {loadingUsers ? (
              <div className="p-6 text-sm text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                No chatbot activity found.
              </div>
            ) : (
              users.map((item) => {
                const user = item.user;
                const isActive = user?._id === selectedUserId;

                return (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={[
                      "flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition last:border-0",
                      isActive ? "bg-blue/10" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-sm font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {user.name}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {user.email}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
                        <span className="rounded bg-gray-100 px-2 py-0.5">
                          {item.totalChats} questions
                        </span>
                        {item.hiddenChats > 0 && (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">
                            {item.hiddenChats} hidden
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-[11px] text-gray-400">
                        Last: {formatDateTime(item.lastChatAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <UserRoundIcon className="h-4 w-4 text-blue" />
                {selectedUser?.name || "Select a user"}
              </p>
              <p className="text-xs text-gray-500">
                {selectedUser?.email || "Choose a user to view chatbot history"}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MessageSquareTextIcon className="h-4 w-4" />
              {pagination.total} conversations
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto bg-gray-50/60 p-4">
            {loadingChats ? (
              <div className="rounded-md bg-white p-6 text-sm text-gray-500">
                Loading conversations...
              </div>
            ) : chats.length === 0 ? (
              <div className="rounded-md bg-white p-6 text-sm text-gray-500">
                No conversations match these filters.
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => (
                  <article
                    key={chat._id}
                    className={[
                      "rounded-lg border bg-white p-4 shadow-sm",
                      chat.isHidden ? "border-amber-200 opacity-75" : "border-gray-200",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded bg-blue/10 px-2 py-1 font-semibold text-blue">
                            {getProviderLabel(chat.metadata?.provider)}
                          </span>
                          {chat.isHidden && (
                            <span className="rounded bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                              Hidden
                            </span>
                          )}
                          <span className="text-gray-400">
                            {formatDateTime(chat.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleToggleHidden(chat)}
                          disabled={updatingChatId === chat._id}
                          title={chat.isHidden ? "Restore chat" : "Hide chat"}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                          {chat.isHidden ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeOffIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteChat(chat._id)}
                          disabled={updatingChatId === chat._id}
                          title="Delete chat"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Question
                        </p>
                        <p className="mt-1 whitespace-pre-wrap rounded-md bg-gray-100 p-3 text-sm leading-6 text-gray-900">
                          {chat.question}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Answer
                        </p>
                        <p className="mt-1 whitespace-pre-wrap rounded-md bg-white p-3 text-sm leading-6 text-gray-700 ring-1 ring-gray-100">
                          {chat.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
              <button
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.max(current.page - 1, 1),
                  }))
                }
                disabled={pagination.page <= 1}
                className="rounded-md border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.min(current.page + 1, current.totalPages),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-md border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserActivity;
