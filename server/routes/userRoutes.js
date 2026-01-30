import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getUserData } from '../controllers/userController.js';
import { updateProfile } from '../controllers/userController.js';

const userRouter = express.Router();

// Define user-related routes here
userRouter.get('/data', userAuth, getUserData);
userRouter.put("/profile", userAuth, updateProfile);

export default userRouter;