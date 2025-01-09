export const DB_NAME = 'techgik';

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: 'connected',
  // ? when user gets disconnected
  DISCONNECT_EVENT: 'disconnect',
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: 'joinChat',
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: 'leaveChat',
  // ? when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: 'updateGroupName',
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: 'messageReceived',
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: 'newChat',
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: 'socketError',
  // ? when participant stops typing
  STOP_TYPING_EVENT: 'stopTyping',
  // ? when participant starts typing
  TYPING_EVENT: 'typing',
  // ? when message is deleted
  MESSAGE_DELETE_EVENT: 'messageDeleted',
  // ? when user is online
  USER_ONLINE_EVENT: 'userOnline',
  // ? when user is online
  UPDAT_USER_ONLINE_EVENT: 'update-user-status',
});

export const AvailableChatEvents = Object.values(ChatEventEnum);

export const globalconstants = {
  responseFlags: {
    PARAMETER_MISSING: 100,
    SHOW_ERROR_MESSAGE: 201,
    INVALID_ACCESS_TOKEN: 101,
    ERROR_IN_EXECUTION: 404,
    VALIDATION_FAILED: 400,
    INTERNAL_SERVER_ERROR: 500,
    ACTION_COMPLETE: 200,
    // You can add more flags here as needed
  },
};

/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
export const UserRolesEnum = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const AvailableUserRoles = Object.values(UserRolesEnum);
