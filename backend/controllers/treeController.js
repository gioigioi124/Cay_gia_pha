const FamilyTree = require("../models/FamilyTree");

// @desc    Get all trees for current user
// @route   GET /api/trees
// @access  Private
const getTrees = async (req, res, next) => {
  try {
    const trees = await FamilyTree.find({
      $or: [{ ownerId: req.user._id }, { "sharedWith.userId": req.user._id }],
    }).populate("ownerId", "displayName email avatar");

    res.json({
      success: true,
      count: trees.length,
      data: trees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new tree
// @route   POST /api/trees
// @access  Private
const createTree = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const tree = await FamilyTree.create({
      name,
      description,
      ownerId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tree by ID
// @route   GET /api/trees/:id
// @access  Private
const getTree = async (req, res, next) => {
  try {
    const tree = await FamilyTree.findById(req.params.id)
      .populate("ownerId", "displayName email avatar")
      .populate("members");

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found.",
      });
    }

    // Check access
    const isOwner = tree.ownerId._id.toString() === req.user._id.toString();
    const isShared = tree.sharedWith.some(
      (s) => s.userId.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this tree.",
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tree
// @route   PUT /api/trees/:id
// @access  Private (owner only)
const updateTree = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    let tree = await FamilyTree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found.",
      });
    }

    // Only owner can update
    if (tree.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can update this tree.",
      });
    }

    tree = await FamilyTree.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tree
// @route   DELETE /api/trees/:id
// @access  Private (owner only)
const deleteTree = async (req, res, next) => {
  try {
    const tree = await FamilyTree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found.",
      });
    }

    if (tree.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can delete this tree.",
      });
    }

    await FamilyTree.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Family tree deleted.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share tree with another user
// @route   POST /api/trees/:id/share
// @access  Private (owner only)
const shareTree = async (req, res, next) => {
  try {
    const { userId, role } = req.body;

    const tree = await FamilyTree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({
        success: false,
        message: "Family tree not found.",
      });
    }

    if (tree.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can share this tree.",
      });
    }

    // Check if already shared
    const alreadyShared = tree.sharedWith.find(
      (s) => s.userId.toString() === userId,
    );

    if (alreadyShared) {
      alreadyShared.role = role || "viewer";
    } else {
      tree.sharedWith.push({ userId, role: role || "viewer" });
    }

    await tree.save();

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrees,
  createTree,
  getTree,
  updateTree,
  deleteTree,
  shareTree,
};
