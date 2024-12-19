import { User } from "../../models/auth/user.models.js";
import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../../utils/mail.js";

class UserRepository {
  // Create a new user
  async create(userData, req) {
    const user = new User({
      ...userData,
      isEmailVerified: false,
      // role: role || UserRolesEnum.USER,
    });

    /**
     * unHashedToken: unHashed token is something we will send to the user's mail
     * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
     * tokenExpiry: Expiry to be checked before validating the incoming token
     */
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    /**
     * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
     * The email verification is handled by {@link verifyEmail}
     */
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await sendEmail({
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get(
          "host"
        )}/api/v1/user/verify-email/${unHashedToken}`
      ),
    });
    return await user.save();
  }

  // Read all users
  async findAll() {
    return await User.find();
  }

  // Find user by ID
  async findById(id) {
    return await User.findById(id);
  }

  // Find user by ID
  async getUserByParm(id) {
    return await User.findOne({ email });
  }

  // Update user by ID
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete user by ID
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}

// module.exports = new UserRepository();

export default new UserRepository();
