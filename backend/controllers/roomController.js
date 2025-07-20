import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { deleteRoom, getRoomById, saveRoom, updateRoom } from "@/services/roomService.js"

export const getRoomsByEventIDController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getRoomById(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get rooms", 500));
    }
    return res.status(200).json(response);
});

export const addRoomController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveRoom(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add room", 500));
    }
    return res.status(200).json(response);
});

export const updateRoomController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateRoom(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update room", 500));
    }
    return res.status(200).json(response);
});

export const deleteRoomController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Room ID is required", 400));
    }
    const response = await deleteRoom(id);
    if (!response) {
        return next(new ErrorHandler("Failed to delete room", 500));
    }
    return res.status(200).json(response);
});


