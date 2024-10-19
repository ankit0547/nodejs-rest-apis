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
  getAllUsers,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../validation/auth/authValidator.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validation/auth/authValidationSchema.js";
import { User } from "../../models/auth/user.models.js";
import { UserProfile } from "../../models/auth/user.profile.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { globalconstants } from "../../constants.js";

const router = Router();

router
  .route("/register")
  .post(validateRequest(registerUserSchema), registerUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/login").post(validateRequest(loginUserSchema), loginUser);

router.route("/").get(verifyJWT, getCurrentUser);
// router.route("/profile:id").put(verifyJWT, updateUserProfile);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/reset-password/:resetToken").post(resetForgottenPassword);

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
