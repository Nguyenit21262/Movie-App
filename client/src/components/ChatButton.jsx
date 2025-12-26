import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Film } from "lucide-react";

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatWindowRef = useRef(null);

  // Đóng chat khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        const chatButton = document.getElementById("chat-button");
        if (chatButton && !chatButton.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-5 z-50">
      {/* Nút Bong Bóng Chat */}
      <button
        id="chat-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-14 h-14 rounded-full
          bg-gray-900 text-white shadow-lg hover:shadow-2xl
          transition-all duration-300 transform hover:scale-110
          ${isOpen ? "rotate-90" : "rotate-0"}
          border-2 border-white/10
        `}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Cửa Sổ Chat */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="absolute bottom-20 right-0 w-80 sm:w-96 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col transition-all duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="p-4 text-white border-b border-gray-800 flex-shrink-0 bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                  <Film className="w-5 h-5 " />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-gray-100">Chat Bot</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-400">Trực tuyến</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Trống để render tin nhắn */}
          <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto bg-gray-900 px-4 py-2">
           
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3 transition-all">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-100 placeholder:text-gray-500"
              />
              <button className="text-white transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center uppercase tracking-[0.2em]">
              AI Movie Assistant
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;