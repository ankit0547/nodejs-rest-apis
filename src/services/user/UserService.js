import UserRepository from "../../repositories/user/UserRepository.js";

class UserService {
  async createUser(userData, req) {
    return await UserRepository.create(userData, req);
  }

  async getAllUsers() {
    return await UserRepository.findAll();
  }

  async getUserById(id) {
    return await UserRepository.findById(id);
  }
  async getUser(email, username) {
    return await UserRepository.getUser(email, username);
  }
  async generateAccessAndRefreshTokens(userId) {
    return await UserRepository.generateAccessAndRefreshTokens(userId);
  }
  async getUserDetailsWithoutPassword(userId) {
    return await UserRepository.getUserDetailsWithoutPassword(userId);
  }
  async verifyJwtToken(incomingRefreshToken) {
    return await UserRepository.verifyJwtToken(incomingRefreshToken);
  }
  async verifyEmailToken(incomingEmailHashedToken) {
    return await UserRepository.verifyEmailToken(incomingEmailHashedToken);
  }
  async verifyPasswordResetTokenAndUpdate(
    incomingPaaswordHashedToken,
    newPassword
  ) {
    return await UserRepository.verifyPasswordResetTokenAndUpdate(
      incomingPaaswordHashedToken,
      newPassword
    );
  }

  async updateUser(id, updateData) {
    return await UserRepository.update(id, updateData);
  }

  async deleteUser(id) {
    return await UserRepository.delete(id);
  }

  async getUserByPasswordResetToken(resetToken) {
    return await UserRepository.getUserByPasswordResetToken(resetToken);
  }
}

export default new UserService();
