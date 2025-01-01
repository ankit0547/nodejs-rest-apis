// const Group = require('../models/Group');
import { GroupModel } from '../../models/index.js';

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const group = await GroupModel.create({
      name,
      description,
      members,
      createdBy: req.user.id,
    });
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all groups for the user
export const getGroups = async (req, res) => {
  try {
    const groups = await GroupModel.find({ members: req.user.id });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a member to the group
export const addMember = async (req, res) => {
  try {
    const group = await GroupModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.body.memberId } },
      { new: true },
    );
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a member from the group
export const removeMember = async (req, res) => {
  try {
    const group = await GroupModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.body.memberId } },
      { new: true },
    );
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
