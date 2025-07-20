import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { deleteAssignment, deleteEventMaterial, getAssignment, getEventInterpreters, getEventMaterials, getEventMaterialsByEventID, getLanguages, saveAssignment, saveEventMaterials, updateAssignment } from "@/services/interpreterService.js"
import multer from "multer"

export const getInterpretersByEventIDController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventInterpreters(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get interpreters", 500));
    }
    return res.status(200).json(response);
});

export const getEventMaterialsByEventIDControlller = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventMaterialsByEventID(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get event materials by event ID", 500));
    }
    return res.status(200).json(response);
});

export const getLanguageController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    const response = await getLanguages(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get languages", 500));
    }
    return res.status(200).json(response);
});

export const addAssignmentController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveAssignment(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add assignment", 500));
    }
    return res.status(200).json(response);
});

export const updateAssignmentController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateAssignment(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update assignment", 500));
    }
    return res.status(200).json(response);
});

export const getAssignmentController = catchAsyncError(async (req, res, next) => {
    const response = await getAssignment();
    if (!response) {
        return next(new ErrorHandler("Failed to get assignment", 500));
    }
    return res.status(200).json({ success: true, result: response });
});

export const deleteAssignmentController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Assignment ID is required", 400));
    }
    const response = await deleteAssignment(id);
    if (!response) {
        return next(new ErrorHandler("Failed to delete assignment", 500));
    }
    return res.status(200).json(response);
});

export const addEventMaterialsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveEventMaterials(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add event materials", 500));
    }
    return res.status(200).json(response);
});

export const getEventMaterialsController = catchAsyncError(async (req, res, next) => {
    const response = await getEventMaterials();
    if (!response) {
        return next(new ErrorHandler("Failed to get event materials", 500));
    }
    return res.status(200).json({ success: true, result: response });
});

export const deleteEventMaterialController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Event material ID is required", 400));
    }
    const response = await deleteEventMaterial(id);
    if (!response) {
        return next(new ErrorHandler("Failed to delete event material", 500));
    }
    return res.status(200).json(response);
});

export const uploadEventMaterialController = catchAsyncError(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorHandler("File is required", 400));
    }
    return res.status(200).send(req.file);
});



