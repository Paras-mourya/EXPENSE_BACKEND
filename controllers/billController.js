import Bill from "../models/Bill.js";
import AppError from "../utils/error.utils.js";

const getBills = async (req,res,next) => {
    try {
         const bills = await Bill.find().sort({ dueDate: 1 });
      res.status(200).json({
        success:true,
        message:"bills get",
        bills,
      })
    } catch (error) {
        return next (new AppError(error.message,500))
    }
}

export {getBills}