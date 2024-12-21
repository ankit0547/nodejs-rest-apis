import { RoleModel } from "../models/index.js";

export function checkPermission(resource, action) {
  return async (req, res, next) => {
    try {
      const user = req.user; // Assume user is attached to the request
      if (!user || !user.role) {
        return res
          .status(403)
          .json({ message: "Access Denied: User role not found" });
      }

      // Fetch the role and its permissions from MongoDB
      const role = await RoleModel.findOne({ name: user.role });
      if (!role) {
        return res
          .status(403)
          .json({ message: "Access Denied: Role not found" });
      }

      // Check if the role has the required action on the resource
      const hasPermission = role.permissions.some(
        (perm) => perm.resource === resource && perm.actions.includes(action)
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: "Access Denied: Insufficient permissions" });
      }

      next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  };
}
