import bcrypt from "bcrypt";
import crypto from "node:crypto";
import slugify from "slugify";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import {
  AvailableUserRoles,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserRolesEnum,
} from "../../constants.js";
// import { Cart } from "../ecommerce/cart.models.js";
// import { EcomProfile } from "../ecommerce/profile.models.js";
// import { SocialProfile } from "../social-media/profile.models.js";

const userSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    address: {
      address1: { type: String, default: "" },
      address2: { type: String, default: "" }, // Optional field
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // Reference to Role model
    // role: {
    //   type: String,
    //   enum: AvailableUserRoles,
    //   default: UserRolesEnum.USER,
    //   required: true,
    // },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    status: {
      type: String,
      default: "Active",
    },
    // loginType: {
    //   type: String,
    //   enum: AvailableSocialLogins,
    //   default: UserLoginType.EMAIL_PASSWORD,
    // },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
userSchema.methods.generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  return { unHashedToken, hashedToken, tokenExpiry };
};

userSchema.pre("save", async function (next) {
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
userSchema.pre("findOneAndUpdate", async function (next) {
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

export const User = mongoose.model("User", userSchema);
