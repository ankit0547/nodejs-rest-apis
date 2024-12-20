import { Router } from "express";
import {
  forgotPasswordRequest,
  verifyEmail,
  resetForgottenPassword,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getAllUsers,
  updateUserProfile,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../validation/auth/authValidator.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validation/auth/authValidationSchema.js";
import { AuthController, UserController } from "../../controllers/index.js";

const router = Router();

// Auth Routes
router
  .route("/login")
  .post(validateRequest(loginUserSchema), AuthController.login);
router.route("/logout").post(verifyJWT, AuthController.logout);
router.route("/refresh-token").post(AuthController.refreshAccessToken);
router
  .route("/verify-email/:verificationToken")
  .get(AuthController.getVerifyEmail);

router.route("/forgot-password").post(AuthController.forgotPasswordRequest);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/reset-password/:resetToken").post(resetForgottenPassword);

// User Secure Routes
router
  .route("/register")
  .post(validateRequest(registerUserSchema), UserController.createUser);

router.route("/").get(verifyJWT, getCurrentUser);
router.route("/profile:id").put(verifyJWT, updateUserProfile);

// Secured routes

router.route("/all").get(getAllUsers);

export default router;
