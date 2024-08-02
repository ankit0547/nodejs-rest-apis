import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  forgotPasswordRequest,
  verifyEmail,
  resetForgottenPassword,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

// Unsecured route
router.route("/register").post(registerUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/forgot-password").post(forgotPasswordRequest);

router.route("/reset-password/:resetToken").post(resetForgottenPassword);

export default router;
