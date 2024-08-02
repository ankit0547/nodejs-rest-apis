import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../../controllers/auth/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { registerUserValidator } from "../../validation/auth/authValidator.js";

const router = Router();

// Unsecured route
router.route("/register").post(registerUserValidator, registerUser);

router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
