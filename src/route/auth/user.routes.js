import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  forgotPasswordRequest,
  verifyEmail,
  resetForgottenPassword,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../validation/auth/authValidator.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validation/auth/authValidationSchema.js";

const router = Router();

router
  .route("/register")
  .post(validateRequest(registerUserSchema), registerUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/login").post(validateRequest(loginUserSchema), loginUser);

router.route("/").get(verifyJWT, getCurrentUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/reset-password/:resetToken").post(resetForgottenPassword);

export default router;
