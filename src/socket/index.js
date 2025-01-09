import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { AvailableChatEvents, ChatEventEnum } from '../constants.js';
// import { User } from '../models/apps/auth/user.models.js';
import { ApiError } from '../utils/ApiError.js';
import { UserModel } from '../models/index.js';
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
        console.log('No auth token received');
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
      if (userId) {
        // Mark user as online
        if (!user[userId]) {
          user[userId] = { sockets: [], status: 'online' };
        }
        user[userId].sockets.push(socket.id);
        user[userId].status = 'online';

        socket.broadcast.emit('userStatusChange', { userId, status: 'online' });

        console.log(`User ${userId} is online with socket ${socket.id}`);
      }

      console.info(
        'User connected 🗼. userId: ',
        user._id.toString(),
        socket.id,
      );

      // When a user disconnects
      socket.on('disconnect', () => {
        if (userId && user[userId]) {
          user[userId].sockets = user[userId].sockets.filter(
            (id) => id !== socket.id,
          );

          if (user[userId].sockets.length === 0) {
            user[userId].status = 'offline';
            socket.broadcast.emit('userStatusChange', {
              userId,
              status: 'offline',
            });

            console.log(`User ${userId} is offline`);
          }
        }
        console.log('User disconnected:', user._id.toString(), socket.id);
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
 * @param {string} roomId - Room where the event should be emitted
 * @param {AvailableChatEvents[0]} event - Event that should be emitted
 * @param {any} payload - Data that should be sent when emitting the event
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get('io').in(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
