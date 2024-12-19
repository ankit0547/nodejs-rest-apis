import { ApiError } from "../../utils/ApiError.js";
import { forgotPasswordMailgenContent, sendEmail } from "../../utils/mail.js";
import UserService from "../user/UserService.js";

class AuthService {
  constructor() {}

  async getVerifiedUser(email, password) {
    const user = await UserService.getUserByEmail(email);
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
    return { user: loggedInUser, accessToken, refreshToken };
  }

  async getRefreshAccessToken(incomingRefreshToken) {
    const decodedToken = await UserService.verifyJwtToken(incomingRefreshToken);

    const user = await UserService.getUserById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await UserService.generateAccessAndRefreshTokens(user._id);
    return { accessToken, newRefreshToken };
  }

  async forgotPassword(user) {
    // Generate a temporary token
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken(); // generate password reset creds

    // save the hashed version a of the token and expiry in the DB
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Send mail with the password reset link. It should be the link of the frontend url with token
    await sendEmail({
      email: user?.email,
      subject: "Password reset request",
      mailgenContent: forgotPasswordMailgenContent(
        user.username,
        // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
        // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
      ),
    });
  }
}

export default new AuthService();
