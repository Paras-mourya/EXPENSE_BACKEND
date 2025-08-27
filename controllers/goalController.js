import Goal from "../models/Goal.js";
import AppError from "../utils/error.utils.js";

// ✅ Get all goals of logged-in user
const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }); // only current user's goals
    res.status(200).json({
      success: true,
      message: "goals fetched successfully",
      goals,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get goal by ID (only if belongs to logged-in user)
const getGoalsById = async (req, res, next) => {
  try {
    const goalGet = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goalGet) {
      return next(new AppError("goal not found", 400));
    }

    res.status(200).json({
      success: true,
      message: "goal found successfully",
      goalGet,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Create new goal (attach user id)
const createGoals = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    if (!title || !targetAmount || !currentAmount || !deadline) {
      return next(new AppError("all fields are required", 400));
    }

    const goal = await Goal.create({
      title,
      targetAmount,
      currentAmount,
      deadline,
      user: req.user._id, // attach logged-in user
    });

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `New goal created: ${goal.title}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "goal created successfully",
      goal,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Update goal (only if belongs to logged-in user)
const updateGoal = async (req, res, next) => {
  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedGoal) {
      return next(new AppError("goal not found or unauthorized", 400));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Goal updated: ${updatedGoal.title}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "goal updated successfully",
      updatedGoal,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Delete goal (only if belongs to logged-in user)
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return next(new AppError("goal not found or unauthorized", 400));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Goal deleted: ${goal.title}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "goal deleted successfully",
      goal,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export { getGoals, getGoalsById, createGoals, updateGoal, deleteGoal };
