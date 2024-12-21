import rbacPolicy from "../policies/rbac.policy.js";

export function checkPermission(permission) {
  return (req, res, next) => {
    try {
      const user = req.user; // Assume the user is attached to the request
      if (!user || !user.role) {
        return res
          .status(403)
          .json({ message: "Access Denied: User role not found" });
      }

      // Check if the user's role has the required permission
      const hasPermission = rbacPolicy.can(user.role, permission);
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
