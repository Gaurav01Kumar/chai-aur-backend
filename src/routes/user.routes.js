import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//Secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresToken").post(refreshAccessToken);
export default router;
