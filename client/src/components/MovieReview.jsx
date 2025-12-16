import React, { useState } from "react";

const MovieReview = () => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      text: comment,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setComments([newComment, ...comments]);
    setComment("");
  };

  return (
    <div className="mx-auto max-w-full">
      {/* Comment Form */}
      <div className="mb-8 rounded-md dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
          💬 Comments
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            rows="4"
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-transparent text-gray-800 dark:text-white 
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comment.length}/500
            </span>

            <button
              type="submit"
              disabled={!comment.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium
              hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comment List */}
      <div>
        <h4 className="text-sm font-semibold mb-4 text-gray-800 dark:text-white">
          Comments ({comments.length})
        </h4>

        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No comments yet.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-semibold">
                      U
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-800 dark:text-white">
                        User
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieReview;
