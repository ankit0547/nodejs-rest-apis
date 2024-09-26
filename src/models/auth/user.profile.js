import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

const userProfileSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Users collection
    ref: "User",
    required: true,
    index: true,
  },
  avatar: {
    type: {
      url: String,
      localPath: String,
    },
    default: {
      url: `https://www.gravatar.com/avatar/?d=identicon`,
      localPath: "",
    },
  },
  firstName: { type: String },
  lastName: { type: String },
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userProfileSchema.pre("save", async function (next) {
  const user = this;
  // Ensure both firstName and lastName are available
  if (user.firstName && user.lastName) {
    const fullName = `${user.firstName} ${user.lastName}`;
    // Regex to capture first 3 letters of first and last names
    const regex = /^(\w{3})\w*\s(\w{3})\w*$/;
    const match = fullName.match(regex);

    if (match) {
      const firstNamePart = match[1];
      const lastNamePart = match[2];

      // Create a slug by concatenating the parts
      const rawSlug = `${firstNamePart}-${lastNamePart}`;

      // Optionally use slugify for further cleanup
      const slug = slugify(rawSlug, {
        lower: true, // Convert to lowercase
        strict: true, // Remove special characters (though not needed here)
        replacement: "_", // Replace spaces (but spaces aren't expected here)
      });

      user.username = slug;
    }
  }
  next();
});

// Pre-update hook to prevent changing firstName and lastName
userProfileSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // Prevent firstName or lastName from being changed
  if (update.firstName || update.lastName) {
    const user = await this.model.findOne(this.getQuery());

    if (update.firstName && update.firstName !== user.firstName) {
      return next(new Error("Changing firstName is not allowed"));
    }

    if (update.lastName && update.lastName !== user.lastName) {
      return next(new Error("Changing lastName is not allowed"));
    }
  }

  next();
});

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
