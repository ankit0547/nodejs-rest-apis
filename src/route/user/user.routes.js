import { Router } from 'express';
import { UserController } from '../../controllers/index.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { registerUserSchema } from '../../validation/auth/authValidationSchema.js';
import { validateRequest } from '../../validation/auth/requestValidator.js';
import authorize from '../../middlewares/rbac.middleware.js';

const router = Router();

// User Secure Routes
router
  .route('/register')
  .post(validateRequest(registerUserSchema), UserController.createUser);

router.route('/').get(verifyJWT, UserController.getCurrentUser);
router
  .route('/')
  .put(verifyJWT, authorize('Update profile'), UserController.updateUser);
router.route('/all').get(UserController.getAllUsers);

export default router;
authorize('users', 'update');
