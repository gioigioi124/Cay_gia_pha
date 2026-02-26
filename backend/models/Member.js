const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    familyTreeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyTree",
      required: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Gender is required"],
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    dateOfDeath: {
      type: Date,
      default: null,
    },
    birthPlace: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isAlive: {
      type: Boolean,
      default: true,
    },
    // Relationships
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    spouses: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        },
        marriageDate: Date,
        divorceDate: Date,
      },
    ],
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Member", memberSchema);
