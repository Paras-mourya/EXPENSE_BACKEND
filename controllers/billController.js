import Bill from "../models/Bill.js";
import AppError from "../utils/error.utils.js";
import path from "path";
import fs from "fs";
import cloudinary from "cloudinary";



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


const createBill = async (req, res, next) => {
  try {
    const { vendor, plan, description, dueDate, amount, lastChargeDate } = req.body;

    let logoData = null;

    if (req.file) {
      const filePath = path.resolve(req.file.path).replace(/\\/g, "/");
      console.log(" Uploading bill logo to Cloudinary:", filePath);

      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: "bills",
        resource_type: "auto",
        timeout: 120000,
      });

      console.log(" Cloudinary upload success:", result.secure_url);

      logoData = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      
      await fs.promises.rm(req.file.path);
    }

    const bill = await Bill.create({
      vendor,
      plan,
      description,
      dueDate,
      amount,
      lastChargeDate,
      logo: logoData, 
      user: req.user._id,
    });

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

const updateBill = async (req, res, next) => {
  try {
   
    const oldBill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!oldBill) return next(new AppError("Bill not found", 404));

    let updateData = { ...req.body };

    if (req.file) {
 
      if (oldBill.logo?.public_id) {
        await cloudinary.v2.uploader.destroy(oldBill.logo.public_id);
      }

  
      const filePath = path.resolve(req.file.path).replace(/\\/g, "/");
      console.log("Uploading new bill logo to Cloudinary:", filePath);

      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: "bills",
        resource_type: "auto",
        timeout: 120000,
      });

      console.log("Cloudinary upload success:", result.secure_url);

      updateData.logo = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      await fs.promises.rm(req.file.path);
    }


    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

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


const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!bill) {
      return next(new AppError("Bill not found", 404));
    }

   
    req.io.emit("notification", {
      message: `Bill deleted: ${bill.vendor} - ${bill.plan}`,
      time: new Date(),
    });
    if (bill.logo?.public_id) {
  await cloudinary.v2.uploader.destroy(bill.logo.public_id);
}


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
