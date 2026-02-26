const mongoose = require("mongoose");

const familyTreeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Family tree name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["editor", "viewer"],
          default: "viewer",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FamilyTree", familyTreeSchema);
