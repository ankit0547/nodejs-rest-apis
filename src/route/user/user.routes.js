import { Router } from "express";
import { UserController } from "../../controllers/index.js";
import {
  getCurrentUser,
  updateUserProfile,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { registerUserSchema } from "../../validation/auth/authValidationSchema.js";
import { validateRequest } from "../../validation/auth/authValidator.js";
import { checkPermission } from "../../middlewares/rbac.middleware.js";

const router = Router();

// User Secure Routes
router
  .route("/register")
  .post(
    validateRequest(registerUserSchema),
    checkPermission("write"),
    UserController.createUser
  );

router.route("/").get(verifyJWT, UserController.getCurrentUser);
router
  .route("/")
  .put(verifyJWT, checkPermission("write"), UserController.updateUser);
router.route("/all").get(UserController.getAllUsers);

export default router;
