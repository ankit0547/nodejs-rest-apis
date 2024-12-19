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
  async getUserByEmail(email) {
    return await UserRepository.getUserByEmail(email);
  }
  async generateAccessAndRefreshTokens(userId) {
    return await UserRepository.generateAccessAndRefreshTokens(userId);
  }
  async getLoggedInUserWithoutPassword(userId) {
    return await UserRepository.getLoggedInUserWithoutPassword(userId);
  }
  async verifyJwtToken(incomingRefreshToken) {
    return await UserRepository.verifyJwtToken(incomingRefreshToken);
  }

  async updateUser(id, updateData) {
    return await UserRepository.update(id, updateData);
  }

  async deleteUser(id) {
    return await UserRepository.delete(id);
  }
}

export default new UserService();
