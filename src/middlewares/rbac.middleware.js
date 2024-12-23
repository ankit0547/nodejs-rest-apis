// const { UserModel } = require("../models");
import { UserModel } from "../models/index.js";

// Middleware for checking permissions
const authorize = (resource) => async (req, res, next) => {
  try {
    const action = req.method;
    const userId = req.user.id; // Assume user ID is stored in `req.user` (from authentication middleware)
    const user = await UserModel.findById(userId).populate("role");

    if (!user) return res.status(401).json({ message: "User not found" });

    const { permissions } = user.role;

    // Check if the user has the required resource and action permission
    const hasPermission = permissions.some(
      (perm) => perm.resource === resource && perm.actions.includes(action)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    next(); // User has the required permission, proceed to the next middleware
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export default authorize;
