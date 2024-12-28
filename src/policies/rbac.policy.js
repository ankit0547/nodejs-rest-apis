const policies = {
  ADMIN: ['read', 'write', 'delete'],
  USER: ['read'],
  viewer: ['read'],
};

class RBACPolicy {
  can(role, permission) {
    const rolePermissions = policies[role];
    if (!rolePermissions) throw new Error(`Role '${role}' is not defined`);
    return rolePermissions.includes(permission);
  }

  getPermissions(role) {
    const rolePermissions = policies[role];
    if (!rolePermissions) throw new Error(`Role '${role}' is not defined`);
    return rolePermissions;
  }
}

export default new RBACPolicy();
