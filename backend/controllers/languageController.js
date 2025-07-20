import catchAsyncError from "@/middlewares/catchAsyncError.js";
import { deleteLanguage, getEventLanguages, saveLanguage, updateLanguage } from "@/services/languageService.js";
import ErrorHandler from "@/utils/ErrorHandler";

export const getLanguagesByEventIDController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventLanguages(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get event languages", 500));
    }
    return res.status(200).json(response);
});

export const addLanguageController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveLanguage(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add language", 500));
    }
    return res.status(200).json(response);
});

export const updateLanguageController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateLanguage(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update language", 500));
    }
    return res.status(200).json(response);
});

export const deleteLanguageController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Language ID is required", 400));
    }
    const response = await deleteLanguage(id);
    if (!response) {
        return next(new ErrorHandler("Failed to delete language", 500));
    }
    return res.status(200).json(response);
});