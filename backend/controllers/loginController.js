import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { checkEmail, checkPassword, decodeToken, encodeToken } from "@/services/loginService.js"

export const checkEmailExistController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await checkEmail(body);
    if (!response) {
        return next(new ErrorHandler("Failed to check email existence", 500));
    }
    return res.status(200).json(response);
});

export const loginWithPasswordController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await checkPassword(body);
    if (!response) {
        return next(new ErrorHandler("Failed to login with password", 500));
    }
    return res.status(200).json(response);
});



export const decodeTokenController = catchAsyncError(async (req, res, next) => {
    const { token } = req.query;
    if (!token) {
        return next(new ErrorHandler("Token is required", 400));
    }
    try {
        const decoded = decodeToken(token);
        if (!decoded) {
            return next(new ErrorHandler("Invalid or expired token", 401));
        }
        return res.status(200).json({ status: true, data: decoded });
    } catch (error) {
        return next(new ErrorHandler("Failed to decode token", 500));
    }
});


export const encodeTokenController = catchAsyncError(async (req, res, next) => {
    const userDetails = req.body;
    
    try {
        const token = encodeToken(userDetails);
        
        return res.status(200).json({ status: true, token: token });
    } catch (error) {
        return next(new ErrorHandler("Failed to encode data", 500));
    }
});