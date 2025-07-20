import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { getAgenda, getEventSessions, saveAgenda, updateAgenda } from "@/services/sessionService.js";

export const getSessionsByEventIDController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventSessions(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get sessions", 500));
    }
    return res.status(200).json(response);
});

export const addAgendaController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveAgenda(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add agenda", 500));
    }
    return res.status(200).json(response);
});

export const updateAgendaController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateAgenda(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update agenda", 500));
    }
    return res.status(200).json(response);
});

export const getAgendaController = catchAsyncError(async (req, res, next) => {
    const response = await getAgenda();
    if (!response) {
        return next(new ErrorHandler("Failed to get agenda", 500));
    }
    return res.status(200).json(response);
});

export const deleteAgendaController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Agenda ID is required", 400));
    }
    const response = await updateAgenda(id);
    if (!response) {
        return next(new ErrorHandler("Failed to delete agenda", 500));
    }
    return res.status(200).json(response);
});