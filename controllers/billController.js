import Bill from "../models/Bill.js";
import AppError from "../utils/error.utils.js";

// ✅ Get all bills of logged-in user
const getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      message: "Bills fetched successfully",
      bills,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Get single bill by ID
const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });

    if (!bill) {
      return next(new AppError("Bill not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Bill fetched successfully",
      bill,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Create new bill
const createBill = async (req, res, next) => {
  try {
    const { vendor, plan, dueDate, amount, logoUrl, lastChargeDate } = req.body;

    const bill = await Bill.create({
      vendor,
      plan,
      dueDate,
      amount,
      logoUrl,
      lastChargeDate,
      user: req.user._id, // 🔑 Link bill to logged-in user
    });

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `New bill created: ${vendor} - ${plan}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Update bill
const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!bill) {
      return next(new AppError("Bill not found", 404));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Bill updated: ${bill.vendor} - ${bill.plan}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// ✅ Delete bill
const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!bill) {
      return next(new AppError("Bill not found", 404));
    }

    // 🔔 Emit notification
    req.io.emit("notification", {
      message: `Bill deleted: ${bill.vendor} - ${bill.plan}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
      bill,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export { getBills, getBillById, createBill, updateBill, deleteBill };
