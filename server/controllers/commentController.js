import Comment from "../models/Comment.js";

const parseTmdbId = (movieId) => parseInt(movieId, 10);

const validateContent = (content) => {
  if (!content || !content.trim()) return "Comment content is required";
  if (content.trim().length > 1000) return "Comment must be 1000 characters or less";
  return null;
};

export const getMovieComments = async (req, res) => {
  try {
    const tmdbId = parseTmdbId(req.params.movieId);

    // Lấy tất cả comments cùng lúc — không filter parent ở DB
    const allComments = await Comment.find({ movie: tmdbId })
      .populate("user", "name avatar")
      .sort({ createdAt: 1 }) // cũ → mới để build tree đúng thứ tự
      .lean(); // plain JS object, dễ mutate

    // Build tree: map id → node, gắn children vào parent
    const map = {};
    const roots = [];

    for (const c of allComments) {
      map[c._id] = { ...c, children: [] };
    }

    for (const c of allComments) {
      if (c.parent && map[c.parent]) {
        map[c.parent].children.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    }

    // Root comments: mới nhất lên đầu
    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, comments: roots });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const tmdbId = parseTmdbId(req.params.movieId);
    const { content, parentId } = req.body;

    const error = validateContent(content);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // Nếu là reply, kiểm tra parent tồn tại
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      user: req.userId,
      movie: tmdbId,
      content: content.trim(),
      parent: parentId || null,
    });

    const populated = await comment.populate("user", "name avatar");

    return res.status(201).json({ success: true, comment: { ...populated.toObject(), children: [] } });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const error = validateContent(content);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this comment" });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("user", "name avatar");

    return res.status(200).json({ success: true, message: "Comment updated successfully", comment });
  } catch (error) {
    console.error("Update comment error:", error);
    return res.status(500).json({ success: false, message: "Failed to update comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const comment = await Comment.findById(commentId).populate("parent", "user");
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isOwner = comment.user.toString() === userId.toString();
    const isParentOwner =
      comment.parent && comment.parent.user.toString() === userId.toString();

    if (!isOwner && !isParentOwner) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    if (!comment.parent) {
      // Parent comment → xóa tất cả descendants (đệ quy)
      const deleteDescendants = async (parentId) => {
        const children = await Comment.find({ parent: parentId });
        for (const child of children) {
          await deleteDescendants(child._id);
          await child.deleteOne();
        }
      };
      await deleteDescendants(commentId);
    }

    await comment.deleteOne();

    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

export const getCommentCount = async (req, res) => {
  try {
    const tmdbId = parseTmdbId(req.params.movieId);
    const count = await Comment.countDocuments({ movie: tmdbId });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Get comment count error:", error);
    return res.status(500).json({ success: false, message: "Failed to get comment count" });
  }
};


export const getUserComments = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ user: userId })
        .populate("parent", "content user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Comment.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get user comments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user comments" });
  }
};