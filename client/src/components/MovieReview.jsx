import { SendHorizontal, Reply } from "lucide-react";
import React, { useState, useContext } from "react";
import { AppContent } from "../context/AppContext";

const MovieReview = () => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  // Logic cho phần trả lời
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { userData, isLoggedIn } = useContext(AppContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim() || !isLoggedIn) return;

    const newComment = {
      id: Date.now(),
      text: comment,
      userName: userData.name,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      replies: [],
    };

    setComments([newComment, ...comments]);
    setComment("");
  };

  const handleReplySubmit = (parentId) => {
    if (!replyText.trim() || !isLoggedIn) return;

    const newReply = {
      id: Date.now(),
      text: replyText,
      userName: userData.name,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setComments(
      comments.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, newReply] } : c,
      ),
    );
    setReplyText("");
    setReplyTo(null);
  };

  return (
    <div id="comment" className="max-w-6xl mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 text-sm">
          <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
            {isLoggedIn && userData ? userData.name[0].toUpperCase() : "?"}
          </div>

          <div className="flex-1 bg-white dark:bg-gray-900 transition border border-gray-500/30 rounded-md focus-within:border-indigo-500">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-md rounded-b-none p-3 pb-0 outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400"
            />
            <div className="flex items-end justify-end px-3 pb-2">
              <button
                type="submit"
                disabled={!comment.trim()}
                className="active:scale-95 transition-all disabled:opacity-60"
              >
                <SendHorizontal className="w-6 h-6 text-black dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="mt-12">
        <h4 className="text-sm font-semibold mb-6 text-gray-300 dark:text-white">
          Comments ({comments.length})
        </h4>

        {comments.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-6">
            {comments.map((item) => (
              <div key={item.id} className="space-y-4">
                {/* Bình luận chính */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                    {item.userName[0].toUpperCase()}
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {item.userName}
                      </span>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.text}
                    </p>

                    {/* Nút bấm để hiện ô nhập trả lời */}
                    <button
                      onClick={() =>
                        setReplyTo(replyTo === item.id ? null : item.id)
                      }
                      className="mt-2 text-xs text-indigo-500 font-medium hover:underline flex items-center gap-1"
                    >
                      <Reply size={12} /> Rely
                    </button>
                  </div>
                </div>

                {/* Ô nhập Phản hồi (Xuất hiện khi nhấn nút) */}
                {replyTo === item.id && (
                  <div className="ml-12 flex gap-2">
                    <input
                      className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1 text-sm outline-none dark:text-white"
                      placeholder="..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button
                      onClick={() => handleReplySubmit(item.id)}
                      className="text-xs bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Sent
                    </button>
                  </div>
                )}

                {item.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-3 ml-12">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {reply.userName[0].toUpperCase()}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-md p-3 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {reply.userName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {reply.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {reply.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReview;
