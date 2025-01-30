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
        new ApiResponse(200, chats, 'User chats fetched successfully!'),
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
      const senderId = req.user._id;

      // Check if chat already exists
      let chat = await ChatModel.findOne({
        participants: { $all: [senderId, receiverId] },
        isGroupChat: false,
      });

      if (!chat) {
        // Create a new one-to-one chat
        chat = new ChatModel({
          name: `One to one chat`,
          participants: [senderId, receiverId],
          isGroupChat: false,
        });

        await chat.save();
      }

      // logic to emit socket event about the new chat added to the participants
      chat?.participants?.forEach((participant) => {
        if (participant._id.toString() === req.user._id.toString()) return; // don't emit the event for the logged in use as he is the one who is initiating the chat

        // emit event to other participants with new chat as a payload
        emitSocketEvent(
          req,
          participant._id?.toString(),
          ChatEventEnum.NEW_CHAT_EVENT,
          chat,
        );
      });
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { chatId: chat._id },
            'Chat retrieved successfully',
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
}

export default new ChatController();
