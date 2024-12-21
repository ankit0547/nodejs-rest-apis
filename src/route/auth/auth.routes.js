import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../validation/auth/authValidator.js";
import { loginUserSchema } from "../../validation/auth/authValidationSchema.js";
import { AuthController } from "../../controllers/index.js";

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
router
  .route("/change-password")
  .post(verifyJWT, AuthController.changeCurrentPassword);
router.route("/reset-password/:resetToken").post(AuthController.resetPassword);

export default router;
