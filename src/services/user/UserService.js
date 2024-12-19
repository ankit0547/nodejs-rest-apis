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
  async getUserByParm(parm) {
    return await UserRepository.getUserByParm(parm);
  }

  async updateUser(id, updateData) {
    return await UserRepository.update(id, updateData);
  }

  async deleteUser(id) {
    return await UserRepository.delete(id);
  }
}

export default new UserService();
