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
import { User } from "../../models/user/user.models.js";
import { UserProfile } from "../../models/user/user.profile.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { globalconstants } from "../../constants.js";
import { AuthController, UserController } from "../../controllers/index.js";

const router = Router();

// Auth Routes
router
  .route("/login")
  .post(validateRequest(loginUserSchema), AuthController.login);
router.route("/logout").post(verifyJWT, AuthController.logout);
router.route("/refresh-token").post(AuthController.refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);

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
router.route("/deleteAll").get(async (req, res) => {
  try {
    const result1 = await User.deleteMany({});
    const result2 = await UserProfile.deleteMany({});
    console.log(
      `Deleted ${result1.deletedCount} users and ${result2.deletedCount} profiles.`
    );
    return res.json(
      new ApiResponse(
        globalconstants.responseFlags.ACTION_COMPLETE,
        {},
        `Deleted ${result1.deletedCount} users and ${result2.deletedCount} profiles.`
      )
    );
  } catch (error) {
    console.error("Error deleting users:", error);
  }
});

export default router;
