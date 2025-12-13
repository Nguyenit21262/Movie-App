import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Film,
  Star,
  Clock,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể giúp gì cho bạn về phim ảnh?",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const chatBodyRef = useRef(null);

  const filmSuggestions = [
    { icon: <TrendingUp className="w-4 h-4" />, text: "Phim đang thịnh hành" },
    { icon: <Star className="w-4 h-4" />, text: "Phim có rating cao" },
    { icon: <Film className="w-4 h-4" />, text: "Phim mới ra mắt" },
    { icon: <Clock className="w-4 h-4" />, text: "Phim có thời lượng ngắn" },
  ];

  const botResponses = {
    "phim đang thịnh hành":
      "Đây là những phim đang thịnh hành: Dune: Part Two, Oppenheimer, Poor Things...",
    "phim có rating cao":
      "Những phim có rating cao trên IMDb: The Shawshank Redemption, The Godfather, The Dark Knight...",
    "phim mới ra mắt":
      "Phim mới ra mắt: Furiosa: A Mad Max Saga, Kingdom of the Planet of the Apes...",
    "phim có thời lượng ngắn":
      "Phim dưới 2 giờ: Toy Story (81 phút), The Lion King (88 phút)...",
    "khuyến nghị phim":
      "Dựa trên lịch sử xem, bạn có thể thích: Inception, Interstellar, Tenet...",
    "xin chào": "Chào bạn! Tôi có thể giúp bạn tìm phim hay để xem đấy.",
    "cảm ơn": "Không có gì! Chúc bạn xem phim vui vẻ!",
    "thể loại hành động":
      "Phim hành động hay: John Wick, Mad Max: Fury Road, The Dark Knight, Inception...",
    "thể loại lãng mạn":
      "Phim lãng mạn đáng xem: The Notebook, La La Land, Titanic, Before Sunrise...",
    "phim kinh dị":
      "Phim kinh dị nổi bật: Hereditary, Get Out, The Conjuring, A Quiet Place...",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target)
      ) {
        const chatButton = document.getElementById("chat-button");
        if (chatButton && !chatButton.contains(event.target)) {
          setIsOpen(false);
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ngăn scroll khi hover vào cửa sổ chat
  useEffect(() => {
    const preventScrollPropagation = (e) => {
      if (isOpen && chatWindowRef.current?.contains(e.target)) {
        e.stopPropagation();
      }
    };

    document.addEventListener("wheel", preventScrollPropagation, {
      passive: false,
    });
    document.addEventListener("touchmove", preventScrollPropagation, {
      passive: false,
    });

    return () => {
      document.removeEventListener("wheel", preventScrollPropagation);
      document.removeEventListener("touchmove", preventScrollPropagation);
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    // Phản hồi tự động từ bot
    setTimeout(() => {
      const lowerCaseInput = inputValue.toLowerCase();
      let response =
        "Tôi có thể giúp bạn tìm phim theo thể loại, rating, hoặc thời lượng. Bạn muốn tìm phim gì?";

      Object.keys(botResponses).forEach((key) => {
        if (lowerCaseInput.includes(key)) {
          response = botResponses[key];
        }
      });

      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInputValue("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: messages.length + 1,
      text: suggestion,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text:
          botResponses[suggestion.toLowerCase()] ||
          `Đây là những gì tôi tìm thấy về "${suggestion}"...`,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Xin chào! Tôi có thể giúp gì cho bạn về phim ảnh?",
        sender: "bot",
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Nút chat */}
      <button
        id="chat-button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(scrollToBottom, 100);
          }
        }}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full
          bg-linear-to-br from-yellow-600 to-orange-500
          text-white shadow-lg hover:shadow-xl
          transition-all duration-300 transform hover:scale-105
          ${isOpen ? "rotate-90" : "rotate-0"}
          border-2 border-white
        `}
        aria-label="Mở chat hỗ trợ phim"
      >
        <MessageCircle className="w-6 h-6" />
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="absolute bottom-16 right-0 w-80 h-[450px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 flex flex-col"
          style={{
            maxHeight: "calc(100vh - 100px)",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-500 px-4 py-3 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Chat hỗ trợ phim</h3>
                  <p className="text-xs text-white/80">Trợ lý khuyến nghị</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                  title="Xóa cuộc trò chuyện"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Body - Messages */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-gray-50 to-white"
            onWheel={(e) => e.stopPropagation()}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2 ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs leading-relaxed">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll indicator */}
          {chatBodyRef.current &&
            chatBodyRef.current.scrollHeight >
              chatBodyRef.current.clientHeight &&
            chatBodyRef.current.scrollTop + chatBodyRef.current.clientHeight <
              chatBodyRef.current.scrollHeight - 50 && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="border-t border-gray-200 p-2 flex-shrink-0">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Gợi ý câu hỏi:
              </p>
              <div className="flex flex-wrap gap-1">
                {filmSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-xs text-gray-700 transition-colors border border-gray-200"
                  >
                    {suggestion.icon}
                    <span className="whitespace-nowrap">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Nhập câu hỏi về phim..."
                className="flex-1 p-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-lg ${
                  inputValue.trim()
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                } text-white transition-colors`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Nhấn Enter để gửi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
