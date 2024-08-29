// mongoUtils.js
import mongoose from "mongoose";

// Utility function to create a document
export const createDocument = async (Model, data) => {
  try {
    const document = new Model(data);
    await document.save();
    return document;
  } catch (error) {
    throw new Error(`Error creating document: ${error.message}`);
  }
};

// Utility function to find documents
export const findDocuments = async (
  Model,
  query = {},
  projection = null,
  options = {}
) => {
  try {
    return await Model.find(query, projection, options);
  } catch (error) {
    throw new Error(`Error finding documents: ${error.message}`);
  }
};

// Utility function to find a document by ID
export const findDocumentById = async (Model, id) => {
  try {
    return await Model.findById(id);
  } catch (error) {
    throw new Error(`Error finding document by ID: ${error.message}`);
  }
};

// Utility function to update a document by ID
export const updateDocumentById = async (Model, id, updateData) => {
  try {
    return await Model.findByIdAndUpdate(id, updateData, { new: true });
  } catch (error) {
    throw new Error(`Error updating document: ${error.message}`);
  }
};

// Utility function to delete a document by ID
export const deleteDocumentById = async (Model, id) => {
  try {
    return await Model.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
};

// Utility function for pagination
export const paginateDocuments = async (Model, query = {}, options = {}) => {
  const { page = 1, limit = 10, sort = {} } = options;
  const skip = (page - 1) * limit;

  try {
    const results = await Model.find(query).sort(sort).skip(skip).limit(limit);
    const total = await Model.countDocuments(query);
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: results,
    };
  } catch (error) {
    throw new Error(`Error paginating documents: ${error.message}`);
  }
};

// Utility function for transactions
export const runTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await operations(session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Transaction error: ${error.message}`);
  } finally {
    session.endSession();
  }
};
