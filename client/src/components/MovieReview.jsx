import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { SendHorizontal, Reply, Trash2, Pencil, X, Check } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContent";
import useCommentTree from "../hooks/useCommentTree";
import {
  createMovieComment,
  deleteMovieComment,
  getMovieComments,
  updateMovieComment,
} from "../api/commentApi";

const Avatar = ({ name, size = "md", color = "bg-blue-500" }) => (
  <div
    className={`${size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"} ${color} rounded-full flex items-center justify-center font-semibold shrink-0 text-white`}
  >
    {name?.[0]?.toUpperCase() ?? "?"}
  </div>
);

const CommentNode = ({
  comment,
  depth,
  tmdbId,
  isLoggedIn,
  userData,
  tree,
}) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const replyRef = useRef(null);

  const isOwner = userData?._id === comment.user?._id;

  const onAction = async (type, payload) => {
    if (!payload.trim() || loading) return;
    setLoading(true);
    try {
      let res;
      if (type === "reply") {
        res = await createMovieComment(tmdbId, {
          content: payload,
          parentId: comment._id,
        });
        if (res.data.success) {
          tree.handleAdd(comment._id, res.data.comment);
          setReplyText("");
          setReplyOpen(false);
        }
      } else if (type === "edit") {
        res = await updateMovieComment(tmdbId, comment._id, {
          content: payload,
        });
        if (res.data.success) {
          tree.handleEdit(comment._id, payload);
          setEditing(false);
        }
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await deleteMovieComment(tmdbId, comment._id);
      if (res.data.success) {
        tree.handleDelete(comment._id);
        toast.info("Comment deleted successfully"); // Only toast on delete
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const handleKeyDown = (e, type, payload) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAction(type, payload);
    }
  };

  const indent = Math.min(depth * 24, 96);

  return (
    <div style={{ marginLeft: depth > 0 ? indent : 0 }} className="space-y-2">
      <div className="flex gap-2">
        <Avatar
          name={comment.user?.name}
          size={depth > 0 ? "sm" : "md"}
          color="bg-blue-400"
        />
        <div className="flex-1 border rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black font-bold">
                {comment.user?.name}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            {isOwner && !editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditText(comment.content);
                  }}
                  className="text-black hover:text-blue-500"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={confirmDelete}
                  className="text-black hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "edit", editText)}
                rows={2}
                className="w-full border rounded p-2 text-sm outline-none resize-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(false)}>
                  <X size={15} className="text-gray-400 hover:text-gray-600" />
                </button>
                <button
                  onClick={() => onAction("edit", editText)}
                  disabled={loading}
                >
                  <Check size={15} className="text-blue-600" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {isLoggedIn && !editing && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Reply size={12} /> {replyOpen ? "Cancel" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {replyOpen && (
        <div
          style={{ marginLeft: indent + 36 }}
          className="flex gap-2 items-center"
        >
          <input
            ref={replyRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "reply", replyText)}
            placeholder="Reply..."
            className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={() => onAction("reply", replyText)}
            disabled={!replyText.trim() || loading}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-40"
          >
            <SendHorizontal size={15} />
          </button>
        </div>
      )}

      {comment.children?.map((child) => (
        <CommentNode
          key={child._id}
          comment={child}
          depth={depth + 1}
          tmdbId={tmdbId}
          isLoggedIn={isLoggedIn}
          userData={userData}
          tree={tree}
        />
      ))}
    </div>
  );
};

const MovieReview = () => {
  const { id: tmdbId } = useParams();
  const { userData, isLoggedIn } = useContext(AppContent);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const tree = useCommentTree(setComments);

  const fetchComments = useCallback(async () => {
    try {
      const res = await getMovieComments(tmdbId);
      if (res.data.success) setComments(res.data.comments ?? []);
    } catch (error) {
      console.error("Fetch error", error);
    }
  }, [tmdbId]);

  useEffect(() => {
    if (tmdbId) fetchComments();
  }, [fetchComments, tmdbId]);

  const submitMainComment = async () => {
    if (!newComment.trim() || loading) return;
    setLoading(true);
    try {
      const res = await createMovieComment(tmdbId, {
        content: newComment.trim(),
      });
      if (res.data.success) {
        setComments((prev) => [{ ...res.data.comment, children: [] }, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Submit error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMainKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMainComment();
    }
  };

  const totalCount = useMemo(() => tree.total(comments), [comments, tree]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex gap-3 mb-10">
        <Avatar name={userData?.name} color="bg-blue-600" />
        <div className="flex-1 border rounded-lg overflow-hidden transition-colors">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleMainKeyDown}
            placeholder={isLoggedIn ? "Add a comment..." : "Login to comment"}
            disabled={!isLoggedIn}
            rows={3}
            className="w-full px-3 pt-3 outline-none resize-none text-sm"
          />
          {isLoggedIn && (
            <div className="p-2 flex justify-end">
              <button
                onClick={submitMainComment}
                disabled={loading || !newComment.trim()}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400">
          {totalCount} Comments
        </h4>
        {comments.map((c) => (
          <CommentNode
            key={c._id}
            comment={c}
            depth={0}
            tmdbId={tmdbId}
            isLoggedIn={isLoggedIn}
            userData={userData}
            tree={tree}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieReview;
