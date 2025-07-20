import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { deleteChat, deleteChatHistory, getChats, saveChat } from "@/services/chatService.js"

export const saveChatController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveChat(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save chat", 500));
    }

    return res.status(200).json(response);
});

export const getChatController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }

    const response = await getChats(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save chat", 500));
    }

    return res.status(200).json(response);
});

export const deleteChatController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }

    const response = await deleteChat(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save chat", 500));
    }

    return res.status(200).json(response);
});

export const deleteChatHistoryController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }

    const response = await deleteChatHistory(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save chat", 500));
    }

    return res.status(200).json(response);
});