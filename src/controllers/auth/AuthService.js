const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: UserService } = require("../../services/user/UserService");

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(email, password) {
    if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
    }

    const user = await UserService.getUserByParm(email);

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.getUserById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userRepository.updatePassword(userId, hashedPassword);
  }
}
