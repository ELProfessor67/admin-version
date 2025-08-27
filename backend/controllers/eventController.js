import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler";
import { getRoomProperty, getSessionDetails, saveEventEndTime, saveRoomProperty, saveEvent, updateEvent, getAllEvents, getEventRooms, getEventAgenda, checkEventCode, getEventByID, checkEventUserDetailsExists, getRoomDetails, getSessions, downloadStreamReport, getUserStreamReport, deleteEventUser, startArchive, stopArchive, uploadFile, saveEventFile, eventFilesList, deleteEventFile, updateSelectedLanguage, updateConversionStatus, eventDetails, saveEventUserDetails, uploadEventUsers, updateEventUserDetails, checkEmailID, deleteEvent, saveEventUser, toggleCaption } from "@/services/eventService.js";

export const geSessionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getSessionDetails(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get session details", 500));
    }
    return res.status(200).json(response);
});

export const toggleCaptionController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await toggleCaption(body);
    if (!response) {
        return next(new ErrorHandler("Failed to toggle caption", 500));
    }
    return res.status(200).json(response);
});

export const saveEventEndTimeController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveEventEndTime(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save event end time", 500));
    }
    return res.status(200).json(response);
});

export const getRoomPropertyController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getRoomProperty(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get room property", 500));
    }
    return res.status(200).json(response);
});

export const saveRoomPropertyController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveRoomProperty(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save room property", 500));
    }
    return res.status(200).json(response);
});

export const saveEventController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveEvent(body);
    if (!response) {
        return next(new ErrorHandler("Failed to save event", 500));
    }
    return res.status(200).json(response);
});


export const updateEventController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateEvent(body);
    if (!response) {
        return next(new ErrorHandler("Failed to update event", 500));
    }
    return res.status(200).json(response);
});


export const getAllEventsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getAllEvents(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});

export const getRoomEventsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventRooms(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const getEventAgendaController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getEventAgenda(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});

export const checkEventCodeController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const response = await checkEventCode(id);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const uploadCoverImageController = catchAsyncError(async (req, res, next) => {
    if(!req.file){
        return next(new ErrorHandler("File is required", 400));
    }
    return res.status(200).json(req.file);
});

export const uploadLogoController = catchAsyncError(async (req, res, next) => {
    
    if(!req.file){
        return next(new ErrorHandler("File is required", 400));
    }
    return res.status(200).json(req.file);
});


export const uploadLobbyResourceController = catchAsyncError(async (req, res, next) => {
    return res.status(200).json(req.file);
});

export const uploadLoginPageBgController = catchAsyncError(async (req, res, next) => {
    return res.status(200).json(req.file);
});


export const LandingPageBgController = catchAsyncError(async (req, res, next) => {
    return res.status(200).json(req.file);
});


export const uploadConferencePageBgController = catchAsyncError(async (req, res, next) => {
    return res.status(200).json(req.file);
});



export const getEventByIDController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    const response = await getEventByID(id);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const checkEmailIDController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await checkEmailID(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const checkEventUserDetailsExistsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await checkEventUserDetailsExists(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const getRoomDetailsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getRoomDetails(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const getSessionsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getSessions(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});

export const downloadUserStreamReportController = catchAsyncError(async (req, res, next) => {
    const eventId = req.params.eventId;
    if(!eventId){
        return next(new ErrorHandler("Failed to download report", 500));
    }
    await downloadStreamReport(eventId,res);
});

export const getUserStreamReportController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await getUserStreamReport(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});

export const deleteEventController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    const response = await deleteEvent(id);
    if (!response) {
        return next(new ErrorHandler("Failed to deleet events", 500));
    }
    return res.status(200).json(response);
});

export const deleteEventUserController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    const response = await deleteEventUser(id);
    if (!response) {
        return next(new ErrorHandler("Failed to deleet events", 500));
    }
    return res.status(200).json(response);
});



export const startArchiveController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    const response = await startArchive(id);
    if (!response) {
        return next(new ErrorHandler("Failed to deleet events", 500));
    }
    return res.status(200).json(response);
});

export const stopArchiveController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    const response = await stopArchive(id);
    if (!response) {
        return next(new ErrorHandler("Failed to deleet events", 500));
    }
    return res.status(200).json(response);
});


export const uploadFileController = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }
    uploadFile(id,req,res);
});


export const saveEventFileController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveEventFile(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const eventFileListController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await eventFilesList(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const deleteEventFileController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await deleteEventFile(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const updateSelectedLanguageController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateSelectedLanguage(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const updateConversionStatusController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateConversionStatus(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});

export const eventDetailsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await eventDetails(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const saveEventUserController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await saveEventUser(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const uploadEventUserController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await uploadEventUsers(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});


export const updateEventUserDetailsController = catchAsyncError(async (req, res, next) => {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
        return next(new ErrorHandler("Request body is required", 400));
    }
    const response = await updateEventUserDetails(body);
    if (!response) {
        return next(new ErrorHandler("Failed to get all events", 500));
    }
    return res.status(200).json(response);
});