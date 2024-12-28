import { globalconstants } from '../../constants.js';
import AppLogger from '../../logger/app.logger.js';
import { User } from '../../models/user/user.models.js';
import UserService from '../../services/user/UserService.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

class UserController {
  // Create User
  async createUser(req, res) {
    try {
      const { email } = req.body;
      const existedUser = await User.findOne({ email });

      if (existedUser) {
        throw new ApiError(
          409,
          'User with email or username already exists',
          [],
        );
      }
      const user = await UserService.createUser(req.body, req);

      if (!user) {
        throw new ApiError(
          globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          'Something went wrong while registering the user',
        );
      }

      return res.json(
        new ApiResponse(
          globalconstants.responseFlags.ACTION_COMPLETE,
          {},
          'Users registered successfully and verification email has been sent on your email.',
        ),
      );
      //   res.status(201).json({ success: true, user });
    } catch (err) {
      res
        .status(500)
        .json(
          new ApiError(
            globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
            err.message,
          ),
        );
    }
  }

  // Get All Users
  async getAllUsers(req, res) {
    try {
      AppLogger.info('Fetching all users');
      const users = await UserService.getAllUsers();
      res.status(200).json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get User by ID
  async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get User by ID
  async getUserByParm(req, res) {
    try {
      const { email } = req.body;
      const user = await UserService.getUserByParm(email);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update User
  async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.user._id, req.body);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      res.status(200).json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Delete User
  async deleteUser(req, res) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      res
        .status(200)
        .json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const user = await UserService.getUserDetailsWithoutPassword(
        req.user._id,
      );
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      res.json(
        new ApiResponse(
          globalconstants.responseFlags.ACTION_COMPLETE,
          user,
          'Users details fetched successfully',
        ),
      );
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new UserController();
// module.exports = new UserController();
