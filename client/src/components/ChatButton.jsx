import React, { useContext, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContent";
import { getChatHistory, streamChat } from "../api/chatApi";

const CHAT_SESSION_STORAGE_KEY_PREFIX = "movie-chat-session";

const createConversationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `chat-${crypto.randomUUID()}`;
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getConversationStorageKey = (userId) =>
  `${CHAT_SESSION_STORAGE_KEY_PREFIX}:${userId}`;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildMovieTitleMatcher = (movies = []) => {
  const uniqueMovies = movies
    .filter((movie) => movie?.tmdb_id && movie?.title)
    .filter(
      (movie, index, allMovies) =>
        index ===
        allMovies.findIndex(
          (candidate) =>
            candidate.tmdb_id === movie.tmdb_id &&
            candidate.title.toLowerCase() === movie.title.toLowerCase(),
        ),
    )
    .sort((left, right) => right.title.length - left.title.length);

  if (!uniqueMovies.length) {
    return null;
  }

  return {
    byTitle: new Map(
      uniqueMovies.map((movie) => [movie.title.toLowerCase(), movie]),
    ),
    regex: new RegExp(
      `(${uniqueMovies.map((movie) => escapeRegex(movie.title)).join("|")})`,
      "gi",
    ),
  };
};

const renderAssistantMessage = (content, movies, onMovieClick) => {
  const matcher = buildMovieTitleMatcher(movies);

  if (!matcher || !content) {
    return content;
  }

  const parts = content.split(matcher.regex);
  if (parts.length === 1) {
    return content;
  }

  return parts.map((part, index) => {
    const matchedMovie = matcher.byTitle.get(part.toLowerCase());

    if (!matchedMovie) {
      return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    }

    return (
      <button
        key={`${matchedMovie.tmdb_id}-${index}`}
        type="button"
        onClick={() => onMovieClick(matchedMovie.tmdb_id)}
        className="cursor-pointer font-semibold text-blue-600 underline decoration-blue-400 underline-offset-2 transition-colors hover:text-blue-800"
      >
        {part}
      </button>
    );
  });
};

const ChatButton = () => {
  const navigate = useNavigate();
  const { isLoggedIn, loading, userData } = useContext(AppContent);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const chatWindowRef = useRef(null);
  const bodyRef = useRef(null);
  const conversationStorageKey = userData?._id
    ? getConversationStorageKey(userData._id)
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target)
      ) {
        const chatButton = document.getElementById("chat-button");
        if (chatButton && !chatButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!conversationStorageKey) {
      setConversationId("");
      setMessages([]);
      setHistoryLoaded(false);
      return;
    }

    const storedConversationId =
      window.localStorage.getItem(conversationStorageKey) || "";
    setConversationId(storedConversationId);
    setMessages([]);
    setHistoryLoaded(false);
  }, [conversationStorageKey]);

  useEffect(() => {
    if (!conversationStorageKey) return;

    if (!conversationId) {
      window.localStorage.removeItem(conversationStorageKey);
      return;
    }

    window.localStorage.setItem(conversationStorageKey, conversationId);
  }, [conversationId, conversationStorageKey]);

  useEffect(() => {
    if (!isOpen || !isLoggedIn || historyLoaded) return;

    const loadHistory = async () => {
      try {
        const data = await getChatHistory(conversationId || undefined);
        const historyMessages = (data.history || [])
          .slice()
          .reverse()
          .flatMap((item) => [
            {
              id: `${item.id}-question`,
              role: "user",
              content: item.question,
            },
            {
              id: `${item.id}-answer`,
              role: "assistant",
              content: item.answer,
              metadata: item.metadata || null,
            },
          ]);

        setMessages(historyMessages);
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [conversationId, historyLoaded, isLoggedIn, isOpen]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isOpen]);

  const appendAssistantChunk = (chunk) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];

      if (lastMessage?.role === "assistant" && lastMessage.streaming) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: `${lastMessage.content}${chunk}` },
        ];
      }

      return [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: chunk,
          streaming: true,
        },
      ];
    });
  };

  const finalizeAssistantMessage = () => {
    setMessages((prev) =>
      prev.map((message, index) =>
        index === prev.length - 1 && message.role === "assistant"
          ? { ...message, streaming: false }
          : message,
      ),
    );
  };

  const attachAssistantMetadata = (metadata) => {
    if (!metadata) return;

    setMessages((prev) =>
      prev.map((message, index) =>
        index === prev.length - 1 && message.role === "assistant"
          ? { ...message, metadata }
          : message,
      ),
    );
  };

  const handleMovieClick = (tmdbId) => {
    if (!tmdbId) return;
    navigate(`/movies/tmdb/${tmdbId}`);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setShowClearConfirm(false);

    if (!isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        {
          id: `login-required-${Date.now()}`,
          role: "assistant",
          content:
            "Please sign in to use the chatbot and save your chat history.",
        },
      ]);
      setInput("");
      return;
    }

    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
      },
      {
        id: `assistant-pending-${Date.now()}`,
        role: "assistant",
        content: "",
        streaming: true,
      },
    ]);

    try {
      await streamChat({
        question,
        conversationId,
        onEvent: (event) => {
          if (event.type === "chunk" && event.content) {
            appendAssistantChunk(event.content);
          }

          if (event.type === "done") {
            if (event.conversationId) {
              setConversationId(event.conversationId);
            }
            attachAssistantMetadata(event.metadata);
            finalizeAssistantMessage();
          }

          if (event.type === "error") {
            appendAssistantChunk(
              event.message || "Sorry, I cannot respond right now.",
            );
            finalizeAssistantMessage();
          }
        },
      });
    } catch (error) {
      console.error("Chat stream failed:", error);
      setMessages((prev) => {
        const cleaned =
          prev[prev.length - 1]?.role === "assistant" &&
          prev[prev.length - 1]?.streaming
            ? prev.slice(0, -1)
            : prev;

        return [
          ...cleaned,
          {
            id: `chat-error-${Date.now()}`,
            role: "assistant",
            content:
              "The chatbot is unavailable right now. Please try again in a moment.",
          },
        ];
      });
    } finally {
      setSending(false);
    }
  };

  const clearCurrentChat = () => {
    setConversationId(createConversationId());
    setMessages([]);
    setInput("");
    setHistoryLoaded(true);
    setShowClearConfirm(false);
    setIsOpen(true);
  };

  const handleClearChat = () => {
    if (sending) return;
    setShowClearConfirm(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed right-4 bottom-6 z-50 sm:right-5">
      <button
        id="chat-button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-15 w-15 items-center justify-center rounded-full border border-blue-200 bg-linear-to-br from-blue-500 to-sky-600 text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_45px_rgba(37,99,235,0.45)] ${
          isOpen ? "rotate-90" : "rotate-0"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed inset-x-3 bottom-24 flex h-[min(32rem,calc(100vh-8rem))] w-auto flex-col overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:absolute sm:right-0 sm:bottom-20 sm:left-auto sm:h-[32rem] sm:w-[25rem]"
        >
          <div className="relative overflow-hidden bg-blue px-4 py-4 text-white sm:px-5">
            <div className="absolute inset-0" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase">
                    Movie Chat
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    disabled={sending}
                    className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    New Chat
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {showClearConfirm && (
              <div className="relative mt-3 rounded-lg border border-white/15 bg-white/15 p-3">
                <p className="text-sm font-semibold text-white">
                  Start a new chat?
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={clearCurrentChat}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue transition-colors hover:bg-slate-100"
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-blue-50 via-white to-sky-50 px-4 py-4"
          >
            {!messages.length ? (
              <div className="flex h-full flex-col justify-between">
                <div className="rounded-lg border border-neutral-200 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-[0_10px_25px_rgba(148,163,184,0.12)]">
                  <div className="mb-3 flex items-center gap-2 text-blue">
                    
                    <span className="font-semibold">Movie assistant</span>
                  </div>
                  {loading
                    ? "Checking your sign-in status..."
                    : isLoggedIn
                      ? "Ask about movies, genres, plot twists, actors, or showtimes."
                      : "Sign in to start chatting and keep your conversation history."}
                </div>

                <div className="mt-4 grid gap-2">
                  {["Action movie", "Horror tonight", "Sci-fi with twist"].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setInput(suggestion)}
                        className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  const showTyping =
                    isAssistant && message.streaming && !message.content.trim();

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-full rounded-[22px] px-4 py-2 text-sm leading-6 whitespace-pre-wrap shadow-sm ${
                          isAssistant
                            ? "border border-blue-100 bg-white text-black"
                            : "bg-blue text-white"
                        }`}
                      >
                        {showTyping ? (
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-700 [animation-delay:0ms]" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-600 [animation-delay:120ms]" />
                            <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-500 [animation-delay:240ms]" />
                          </div>
                        ) : isAssistant ? (
                          <>
                            {renderAssistantMessage(
                              message.content,
                              message.metadata?.retrievedMovies || [],
                              handleMovieClick,
                            )}
                          </>
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-blue-100 bg-white px-4 py-4">
            <div className="rounded-[18px] bg-blue-50/70 p-2">
              <div className="flex items-end gap-2 rounded-[18px] bg-white px-2 py-1">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  placeholder="Ask for a movie..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-2xl text-white transition-all hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Send className="h-4.5 w-4.5 text-neutral-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
