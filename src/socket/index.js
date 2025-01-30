import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { AvailableChatEvents, ChatEventEnum } from '../constants.js';
// import { User } from '../models/apps/auth/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { UserModel, UserStatusModel } from '../models/index.js';
import AppLogger from '../logger/app.logger.js';

const initializeSocketIO = (io) => {
  return io.on('connection', async (socket) => {
    try {
      // parse the cookies from the handshake headers (This is only possible if client has `withCredentials: true`)
      const cookies = cookie.parse(socket.handshake.headers?.cookie || '');

      let token = cookies?.accessToken; // get the accessToken

      if (!token) {
        // If there is no access token in cookies. Check inside the handshake auth
        token = socket.handshake.auth?.token;
      }

      // if (!token) {
      //   // Token is required for the socket to work
      //   throw new ApiError(401, 'Un-authorized handshake. Token is missing');
      // }
      if (!token) {
        AppLogger.error('No auth token received');
        socket.disconnect(); // Disconnect if no token
        return;
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // decode the token

      const user = await UserModel.findById(decodedToken?._id).select(
        '-password -refreshToken -emailVerificationToken -emailVerificationExpiry',
      );

      // retrieve the user
      if (!user) {
        throw new ApiError(401, 'Un-authorized handshake. Token is invalid');
      }
      socket.user = user; // mount te user object to the socket

      const userId = user._id.toString();

      // Broadcast the full list of online users to all clients
      const broadcastOnlineUsers = () => {
        UserStatusModel.find({ status: 'online' })
          .then((users) => {
            const onlineUsers = users.map((user) => ({
              userId: user.userId,
              status: user.status,
              lastLogin: user.lastLogin,
            }));
            io.emit('userStatusChange', onlineUsers);
          })
          .catch((error) =>
            AppLogger.error('Error broadcasting online users:', error),
          );
      };
      if (userId) {
        // Update user status to online
        UserStatusModel.findOneAndUpdate(
          { userId },
          {
            socketId: socket.id,
            status: 'online',
          },
          { upsert: true, new: true },
        )
          .then(() => {
            AppLogger.info(`User ${userId} is online`);
            broadcastOnlineUsers();
          })
          .catch((error) =>
            AppLogger.error('Error updating user status:', error),
          );
        AppLogger.info(`User ${userId} is online with socket ${socket.id}`);
      }

      // When a user disconnects
      socket.on('disconnect', () => {
        if (userId) {
          // Remove user status on disconnect
          UserStatusModel.findOneAndUpdate({ userId }, { status: 'offline' })
            .then(() => {
              AppLogger.info(`User ${userId} is offline`);
              broadcastOnlineUsers();
            })
            .catch((error) =>
              AppLogger.error('Error updating user status:', error),
            );
        }
        AppLogger.info('User disconnected:', user._id.toString(), socket.id);
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message ||
          'Something went wrong while connecting to the socket.',
      );
    }
  });
};

/**
 *
 * @param {import("express").Request} req - Request object to access the `io` instance set at the entry point
 * @param {string} chatId - Chat where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, chatId, event, payload) => {
  req.app.get('io').in(chatId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
