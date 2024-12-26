import { globalconstants } from "../../constants.js";
import AuthService from "../../services/auth/AuthService.js";
import UserService from "../../services/user/UserService.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

class AuthController {
  // user login
  async login(req, res) {
    try {
      const { email, username, password } = req.body;

      const user = await AuthService.getVerifiedUser(email, username, password);

      // TODO: Add more options to make cookie more secure and reliable
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      return res
        .status(200)
        .cookie("accessToken", user.accessToken, options) // set the access token in the cookie
        .cookie("refreshToken", user.refreshToken, options) // set the refresh token in the cookie
        .json(
          new ApiResponse(
            200,
            user, // send access and refresh token in response if client decides to save them by themselves
            "User logged in successfully"
          )
        );
    } catch (err) {
      res.json(
        new ApiError(
          globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message
        )
      );
    }
  }
  // user logout
  async logout(req, res) {
    try {
      const user = await UserService.getUserById(req.user._id);

      if (user.refreshToken === "") {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "User already logged out"));
      }

      const isUserLoggedOut = await UserService.updateUser(req.user._id, {
        $set: {
          refreshToken: "",
        },
      });
      if (!isUserLoggedOut) {
        throw new ApiError(500, "Something went wrong while logging out");
      }

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
    } catch (err) {
      res.json(
        new ApiError(
          globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message
        )
      );
    }
  }
  // get new access token
  async refreshAccessToken(req, res) {
    try {
      const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
      }

      const updatedTokens = await AuthService.getRefreshAccessToken(
        incomingRefreshToken
      );
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      return res
        .status(200)
        .cookie("accessToken", updatedTokens.accessToken, options)
        .cookie("refreshToken", updatedTokens.newRefreshToken, options)
        .json(new ApiResponse(200, updatedTokens, "Access token refreshed"));
    } catch (error) {
      return res.json(
        new ApiError(401, error?.message || "Invalid refresh token")
      );
    }
  }
  // forgot password request
  async forgotPasswordRequest(req, res) {
    const { email } = req.body;

    // Get email from the client and check if user exists
    const user = await UserService.getUserByEmail(email);

    if (!user) {
      throw new ApiError(404, "User does not exists", []);
    }

    await AuthService.forgotPassword(user);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Password reset mail has been sent on your mail id"
        )
      );
  }
  // verify email
  async getVerifyEmail(req, res) {
    try {
      const { verificationToken } = req.params;

      if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing");
      }
      await AuthService.verifyEmailAddress(verificationToken);

      return res
        .status(200)
        .json(
          new ApiResponse(200, { isEmailVerified: true }, "Email is verified")
        );
    } catch (err) {
      res.json(
        new ApiError(
          err.statusCode || globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message
        )
      );
    }
  }

  // change current password
  async changeCurrentPassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await AuthService.changePassword(
        req.user._id,
        oldPassword,
        newPassword
      );

      return res
        .status(200)
        .json(new ApiResponse(200, user, "Password changed successfully"));
    } catch (err) {
      res.json(
        new ApiError(
          err.statusCode || globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message
        )
      );
    }
  }
  // reset password
  async resetPassword(req, res) {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    await AuthService.resetPassword(resetToken, newPassword);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  }
}

export default new AuthController();
