import express from "express";
import {
  getMovieComments,
  addComment,
  updateComment,
  deleteComment,
  getCommentCount,
  getUserComments,
} from "../controllers/commentController.js";
import userAuth from "../middlewares/userAuth.js";

const router = express.Router({ mergeParams: true });

// Public
router.get("/", getMovieComments);
router.get("/count", getCommentCount);

// Protected
router.post("/", userAuth, addComment);
router.put("/:commentId", userAuth, updateComment);
router.delete("/:commentId", userAuth, deleteComment);


export const getUserCommentsRoute = [userAuth, getUserComments];

export default router;