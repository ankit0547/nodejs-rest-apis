import { Router } from 'express';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../validation/auth/requestValidator.js';
import { loginUserSchema } from '../../validation/auth/authValidationSchema.js';
import { AuthController } from '../../controllers/index.js';
import AppLogger from '../../logger/app.logger.js';

const router = Router();

// Auth Routes
router
  .route('/login')
  .post(validateRequest(loginUserSchema), AuthController.login);
router.route('/logout').post(verifyJWT, AuthController.logout);
router.route('/refresh-token').post(AuthController.refreshAccessToken);
router
  .route('/verify-email/:verificationToken')
  .get(AuthController.getVerifyEmail);

router.route('/forgot-password').post(AuthController.forgotPasswordRequest);
router
  .route('/change-password')
  .post(verifyJWT, AuthController.changeCurrentPassword);
router.route('/reset-password/:resetToken').post(AuthController.resetPassword);

//RBAC routes

/**
 * Add a new role with resources and actions.
 */
router.post('/roles', async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Validate input
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Check if the role name already exists
    const existingRole = await RoleModel.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already exists' });
    }

    // Create and save the new role
    const newRole = new RoleModel({ name, permissions });
    await newRole.save();

    res.status(201).json({ message: 'Role added successfully', role: newRole });
  } catch (error) {
    AppLogger.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

/**
 * Update an existing role's resources and actions.
 */
router.put('/roles/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, permissions } = req.body;

    // Validate input
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Find and update the role
    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { name, permissions },
      { new: true, runValidators: true }, // Return the updated document
    );

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res
      .status(200)
      .json({ message: 'Role updated successfully', role: updatedRole });
  } catch (error) {
    AppLogger.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
