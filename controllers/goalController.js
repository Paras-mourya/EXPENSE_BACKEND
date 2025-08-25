import Goal from "../models/Goal.js";
import AppError from "../utils/error.utils.js";

const getGoals = async (req,res,next) => {
    try {
        const goals = await Goal.find()
        res.status(200).json({
            success:true,
            message:"goals fetched successfully",
            goals,
        })
    } catch (error) {
        return next (new AppError(error.message,500))
    }
}

const getGoalsById = async(req,res,next) => {
    try {
        const goalGet = await Goal.findById(req.params.id)
        if(goalGet){
            return next(new AppError("goal not found",400))
        }

        res.status(200).json({
            success:true,
            message:"goal found successfully",
            goalGet,
        })
    } catch (error) {
        return next (new AppError(error.message,500))
    }
}

const createGoals = async (req,res,next) => {
    try {
        const {title,targetAmount,currentAmount,deadline} = req.body

        if(!title || !targetAmount || !currentAmount || !deadline){
            return next(new AppError("all fields are required",400))
        }

        const goal = await Goal.create({
            title,
            targetAmount,
            currentAmount,
            deadline

        })

        res.status(200).json({
            success:true,
            message:"goal created successfully",
            goal,

        })
    } catch (error) {
         return next (new AppError(error.message,500))
    }   
}

const updateGoal = async (req,res,next) => {
    try {
        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        )

        res.status(200).json({
            success:true,
            message:"goal updated successfully",
            updatedGoal,
        })
    } catch (error) {
        return next (new AppError(error.message,500))
    }
}

const deleteGoal = async (req,res,next) => {
    const goal = await Goal.findByIdAndDelete(req.params.id)
    if(!goal){
        return next(new AppError("goal not found",400))
    }

    res.status(200).json({
        success:true,
        message:"goal deleted successfully",
        goal,
    })
}

export {getGoals,getGoalsById,createGoals,updateGoal,deleteGoal}