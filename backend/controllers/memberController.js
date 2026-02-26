const Member = require("../models/Member");
const FamilyTree = require("../models/FamilyTree");

// @desc    Get all members of a tree
// @route   GET /api/trees/:treeId/members
// @access  Private
const getMembers = async (req, res, next) => {
  try {
    const members = await Member.find({ familyTreeId: req.params.treeId })
      .populate("parents", "fullName gender avatar")
      .populate("children", "fullName gender avatar")
      .populate("spouses.memberId", "fullName gender avatar");

    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a member to a tree
// @route   POST /api/trees/:treeId/members
// @access  Private
const addMember = async (req, res, next) => {
  try {
    const tree = await FamilyTree.findById(req.params.treeId);
    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found.",
      });
    }

    const memberData = {
      ...req.body,
      familyTreeId: req.params.treeId,
      createdBy: req.user._id,
    };

    const member = await Member.create(memberData);

    // Add member to tree's members array
    tree.members.push(member._id);
    await tree.save();

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member
// @route   GET /api/trees/:treeId/members/:id
// @access  Private
const getMember = async (req, res, next) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      familyTreeId: req.params.treeId,
    })
      .populate("parents", "fullName gender avatar dateOfBirth")
      .populate("children", "fullName gender avatar dateOfBirth")
      .populate("spouses.memberId", "fullName gender avatar dateOfBirth");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member
// @route   PUT /api/trees/:treeId/members/:id
// @access  Private
const updateMember = async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, familyTreeId: req.params.treeId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete member
// @route   DELETE /api/trees/:treeId/members/:id
// @access  Private
const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findOneAndDelete({
      _id: req.params.id,
      familyTreeId: req.params.treeId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    // Remove from tree's members array
    await FamilyTree.findByIdAndUpdate(req.params.treeId, {
      $pull: { members: member._id },
    });

    // Remove references from other members
    await Member.updateMany(
      { familyTreeId: req.params.treeId },
      {
        $pull: {
          parents: member._id,
          children: member._id,
          spouses: { memberId: member._id },
        },
      },
    );

    res.json({
      success: true,
      message: "Member deleted.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add relationship between members
// @route   POST /api/trees/:treeId/members/:id/relationship
// @access  Private
const addRelationship = async (req, res, next) => {
  try {
    const { type, relatedMemberId, marriageDate, divorceDate } = req.body;
    // type: "parent", "child", "spouse"

    const member = await Member.findOne({
      _id: req.params.id,
      familyTreeId: req.params.treeId,
    });

    const relatedMember = await Member.findOne({
      _id: relatedMemberId,
      familyTreeId: req.params.treeId,
    });

    if (!member || !relatedMember) {
      return res.status(404).json({
        success: false,
        message: "Member(s) not found.",
      });
    }

    switch (type) {
      case "parent":
        if (!member.parents.includes(relatedMemberId)) {
          member.parents.push(relatedMemberId);
        }
        if (!relatedMember.children.includes(member._id)) {
          relatedMember.children.push(member._id);
        }
        break;

      case "child":
        if (!member.children.includes(relatedMemberId)) {
          member.children.push(relatedMemberId);
        }
        if (!relatedMember.parents.includes(member._id)) {
          relatedMember.parents.push(member._id);
        }
        break;

      case "spouse":
        const alreadySpouse = member.spouses.some(
          (s) => s.memberId.toString() === relatedMemberId,
        );
        if (!alreadySpouse) {
          member.spouses.push({
            memberId: relatedMemberId,
            marriageDate,
            divorceDate,
          });
          relatedMember.spouses.push({
            memberId: member._id,
            marriageDate,
            divorceDate,
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid relationship type. Use: parent, child, or spouse.",
        });
    }

    await member.save();
    await relatedMember.save();

    res.json({
      success: true,
      message: "Relationship added successfully.",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  addMember,
  getMember,
  updateMember,
  deleteMember,
  addRelationship,
};
