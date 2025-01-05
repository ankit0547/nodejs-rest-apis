import mongoose from 'mongoose';
import { ChatEventEnum, globalconstants } from '../../constants.js';
import { ChatModel, UserModel } from '../../models/index.js';
import { emitSocketEvent } from '../../socket/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

/**
 * @description Utility function which returns the pipeline stages to structure the chat schema with common lookups
 * @returns {mongoose.PipelineStage[]}
 */
const chatCommonAggregation = () => {
  return [
    {
      // lookup for the participants present
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'participants',
        as: 'participants',
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              forgotPasswordToken: 0,
              forgotPasswordExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationExpiry: 0,
            },
          },
        ],
      },
    },
    {
      // lookup for the group chats
      $lookup: {
        from: 'chatmessages',
        foreignField: '_id',
        localField: 'lastMessage',
        as: 'lastMessage',
        pipeline: [
          {
            // get details of the sender
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'sender',
              as: 'sender',
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              sender: { $first: '$sender' },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: '$lastMessage' },
      },
    },
  ];
};

class ChatController {
  constructor() {}

  async getAllChats(req, res) {
    try {
      const chats = await ChatModel.aggregate([
        {
          $match: {
            participants: { $elemMatch: { $eq: req.user._id } }, // get all chats that have logged in user as a participant
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        ...chatCommonAggregation(),
      ]);
      return res.json(
        new ApiResponse(
          200,
          chats, // send access and refresh token in response if client decides to save them by themselves
          'User chats fetched successfully!',
        ),
      );
    } catch (err) {
      res.json(
        new ApiError(
          globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message,
        ),
      );
    }
  }
  async createOrGetAOneOnOneChat(req, res) {
    try {
      const { receiverId } = req.params;

      // Check if it's a valid receiver
      const receiver = await UserModel.findById(
        new mongoose.Types.ObjectId(receiverId),
      );

      if (!receiver) {
        throw new ApiError(404, 'Receiver does not exist');
      }

      // check if receiver is not the user who is requesting a chat
      if (receiver._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot chat with yourself');
      }

      const chat = await ChatModel.aggregate([
        {
          $match: {
            isGroupChat: false, // avoid group chats. This controller is responsible for one on one chats
            // Also, filter chats with participants having receiver and logged in user only
            $and: [
              {
                participants: { $elemMatch: { $eq: req.user._id } },
              },
              {
                participants: {
                  $elemMatch: { $eq: new mongoose.Types.ObjectId(receiverId) },
                },
              },
            ],
          },
        },
        ...chatCommonAggregation(),
      ]);

      if (chat.length) {
        // if we find the chat that means user already has created a chat
        return res
          .status(200)
          .json(new ApiResponse(200, chat[0], 'Chat retrieved successfully'));
      }

      // if not we need to create a new one on one chat
      const newChatInstance = await ChatModel.create({
        name: 'One on one chat',
        participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)], // add receiver and logged in user as participants
        admin: req.user._id,
      });

      // structure the chat as per the common aggregation to keep the consistency
      const createdChat = await ChatModel.aggregate([
        {
          $match: {
            _id: newChatInstance._id,
          },
        },
        ...chatCommonAggregation(),
      ]);

      const payload = createdChat[0]; // store the aggregation result

      if (!payload) {
        throw new ApiError(500, 'Internal server error');
      }

      // logic to emit socket event about the new chat added to the participants
      payload?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat

        // emit event to other participants with new chat as a payload
        emitSocketEvent(
          req,
          participant._id?.toString(),
          ChatEventEnum.NEW_CHAT_EVENT,
          payload,
        );
      });

      return res
        .status(201)
        .json(new ApiResponse(201, payload, 'Chat retrieved successfully'));
    } catch (err) {
      res.json(
        new ApiError(
          globalconstants.responseFlags.INTERNAL_SERVER_ERROR,
          err.message,
        ),
      );
    }
  }
}

export default new ChatController();
