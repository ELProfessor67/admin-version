import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { deletePoll, deletePollQuestion, getIndividualPollQuestionReport, getPollQuestions, getPollReport, getPollsList, getPollsListForAllEvent, savePoll, savePollQuestion, savePollUserAnswer, updatePoll, updatePollQuestion } from "@/services/pollService.js"


//poll response controller
export const saveAnswerController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await savePollUserAnswer(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save poll answer", 500));
    }
    return res.status(200).json(response);
});

//poll question controller
export const addQuestionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await savePollQuestion(body);
    if (!response) {
        return next(new ErrorHandler("Failed to add poll question", 500));
    }
    return res.status(200).json(response);
});



export const getListQuestionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getPollQuestions(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get poll questions", 500));
    }
    return res.status(200).json(response);
});


export const getReportController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getIndividualPollQuestionReport(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get poll report", 500));
    }
    return res.status(200).json(response);
});


export const deletePollQuestionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await deletePollQuestion(body);
    if (!response) {
        return next(new ErrorHandler("Failed to delete poll question", 500));
    }
});


export const updatePollQuestionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updatePollQuestion(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update poll question", 500));
    }
    return res.status(200).json(response);
});


//poll controller
export const createPollController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await savePoll(body);
    if (!response) {
        return next(new ErrorHandler("Failed to create poll", 500));
    }
    return res.status(200).json(response);
});

export const getPollReportController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getPollReport(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get poll report", 500));
    }
    return res.status(200).json(response);
});


export const getPollListController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getPollsList(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get poll list", 500));
    }
    return res.status(200).json(response);
});

export const getPollListForAllEventController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getPollsListForAllEvent(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get poll list for all events", 500));
    }
    return res.status(200).json(response);
});


export const deletePollController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await deletePoll(body);
    if (!response) {
        return next(new ErrorHandler("Failed to delete poll", 500));
    }
    return res.status(200).json(response);
});


export const updatePollController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updatePoll(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update poll", 500));
    }
    return res.status(200).json(response);
});