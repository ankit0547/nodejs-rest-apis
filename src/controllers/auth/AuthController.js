import { globalconstants } from "../../constants.js";
import UserService from "../../services/user/UserService.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

class AuthController {
  // Login User
  async login(req, res) {
    try {
      const { email, username, password } = req.body;

      if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
      }

      const user = await UserService.getUserByEmail(email);

      if (!user) {
        throw new ApiError(404, "User does not exist");
      }
      const isPasswordValid = await user.isPasswordCorrect(password);

      if (!isPasswordValid) {
        throw new ApiError(422, "Invalid user credentials");
      }

      const { accessToken, refreshToken } =
        await UserService.generateAccessAndRefreshTokens(user._id);

      // get the user document ignoring the password and refreshToken field
      const loggedInUser = await UserService.getLoggedInUserWithoutPassword(
        user._id
      );

      // TODO: Add more options to make cookie more secure and reliable
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options) // set the access token in the cookie
        .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
        .json(
          new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
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
  async logout(req, res) {
    try {
      const user = await UserService.getUserById(req.user._id);

      if (user.refreshToken === "") {
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "User already logged out"));
      }

      UserService.updateUser(req.user._id, {
        $set: {
          refreshToken: "",
        },
      });
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
}

export default new AuthController();
