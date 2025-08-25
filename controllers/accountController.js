import Account from "../models/Account.js";


import AppError from "../utils/error.utils.js";

const getAccounts = async (req,res,next) => {
    try {
        const accounts = await Account.find()
        res.status(200).json({
            success:true,
            accounts,

        })
    } catch (error) {
      return next(new AppError(error.message, 500)) 
    }
}

const getAccountById = async (req,res,next) => {
    try {
        const account = await Account.findById(req.params.id);

        if(!account){
            return next(new AppError("account not found",400))
        }
        res.status(200).json({
            success:true,
            message:"account found",
            account,
        })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

const addAccount = async (req,res,next) => {
    try {
        const {accountType,branchName,accountNumber,bankName,balance} = req.body

        if(! accountType || !branchName || !accountNumber || !bankName || !balance){
            return next (new AppError("all fields are required",400))
        }

        const account = await Account.create({
            accountType,
            branchName,
            accountNumber,
            bankName,
            balance
        })

        res.status(200).json({
            success:true,
            message:"account created successfully",
            account,
        })

    } catch (error) {
        return next (new AppError(error.message,500))
    }
}

const updateAccount = async (req,res,next) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id,req.body,{new:true})

        if(!account){
            return next (new AppError("account not found",400))
        }
        res.status(200).json({
            success:true,
            message:"account udpated successfully",
            account,
        })
    } catch (error) {
          return next (new AppError(error.message,500))
    }
}

const deleteAccount = async (req,res,next) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id)
          if(!account){
            return next (new AppError("account not found",400))
        }
        res.status(200).json({
            success:true,
            message:"account deleted successfully",
        account,
        })
    } catch (error) {
         return next (new AppError(error.message,500))
    }
}

export {getAccounts,getAccountById,addAccount,updateAccount,deleteAccount}