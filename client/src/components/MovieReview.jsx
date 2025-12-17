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
    <div className="max-w-6xl mx-auto  px-4 sm:px-0">
      {/* Comment Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 text-sm">
          {/* Avatar */}
          <img
            className="w-9 h-9 rounded-full object-cover"
            src=""
            alt="user"
          />

          {/* Input box */}
          <div className="flex-1 bg-white dark:bg-gray-900 transition border border-gray-500/30 rounded-md focus-within:border-indigo-500">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-md rounded-b-none p-3 pb-0 outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400"
            />

            <div className="flex items-center justify-between px-3 pb-2">
              {/* Left icons */}
              <div className="flex items-center gap-3 text-gray-500">
                <button type="button" aria-label="Add photo">
                  📎
                </button>
                <button type="button" aria-label="Add emoji">
                  😊
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all text-white font-medium px-5 py-2 rounded disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="mt-12">
        <h4 className="text-sm font-semibold mb-6 text-gray-800 dark:text-white">
          Comments ({comments.length})
        </h4>

        {comments.length === 0 ? (
          <p className="text-center text-gray-500">
            No comments yet.
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                  U
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 dark:text-white">
                      User
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.text}
                  </p>
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
