import catchAsyncError from "@/middlewares/catchAsyncError.js";
import ErrorHandler from "@/utils/ErrorHandler.js";
import { deleteSpeakerCredentials, getSpeakerCredentials, saveSpeakerDetails } from "@/services/speakerService.js";
import { fileUploadMiddleware } from "@/middlewares/multerMiddleware.js";
import EventUsersModel from "@/models/eventUserModel.js";
import SpeakerUser from "@/models/speakerModel.js";
import path from "path";
import fs from "fs";

export const saveUserController = catchAsyncError(async (req, res, next) => {
    try {
        const eventUserID = req.params.id;
        
        if (!eventUserID) {
            return next(new ErrorHandler("User id is missing", 400));
        }

        // Check if event user exists
        const eventUserData = await EventUsersModel.findById(eventUserID);
        if (!eventUserData) {
            return next(new ErrorHandler("No users details found", 404));
        }

        // Create directory structure using fs instead of exec
        const basePath = path.resolve(process.cwd(), 'uploads');
        const eventPath = path.join(basePath, eventUserID);
        const userLogoPath = path.join(eventPath, 'user_logo');

        // Create directories if they don't exist
        if (!fs.existsSync(eventPath)) {
            fs.mkdirSync(eventPath, { recursive: true });
        }
        if (!fs.existsSync(userLogoPath)) {
            fs.mkdirSync(userLogoPath, { recursive: true });
        }

        // Use multer middleware for file upload
        const uploadMiddleware = fileUploadMiddleware("user_logo", "logo");
        
        uploadMiddleware(req, res, async (error) => {
            if (error) {
                let response = {
                    status: 'failed',
                    error: 'Validation Error',
                    errorStatus: error
                };

                if (error.code === 'LIMIT_FILE_SIZE') {
                    response.message = 'File Size is too large. Allowed file size is 50MB';
                } else if (error.code === 'ENOENT') {
                    response.message = 'No folder exists';
                } else {
                    response.message = 'Upload failed. Please try again later';
                }

                return res.status(400).json(response);
            }

            // Validate request body
            if (!req.body) {
                return res.status(400).json({
                    status: 'failed',
                    error: 'Validation Error',
                    message: 'Invalid parameters'
                });
            }

            // Handle update existing speaker
            if (req.body.speaker_id && req.body.speaker_id.trim() !== "") {
                
                const userDetails = {
                    body: req.body,
                    file: req.file,
                    user_id: eventUserID
                };

                const response = await saveSpeakerDetails(userDetails);
                return res.status(200).json(response);
            }

            // Handle create new speaker
            if (req.body.name && req.body.name.trim() !== "" && 
                req.body.role && req.body.role.trim() !== "") {
                
                const userDetails = {
                    body: req.body,
                    file: req.file && req.file.fieldname ? req.file : null,
                    user_id: eventUserID
                };

                const response = await saveSpeakerDetails(userDetails);
                return res.status(200).json(response);
            }

            // Validation errors
            if (!req.body.name || req.body.name.trim() === "") {
                return res.status(400).json({
                    status: 'failed',
                    error: 'Validation Error',
                    message: 'Name is missing'
                });
            }

            if (!req.body.role || req.body.role.trim() === "") {
                return res.status(400).json({
                    status: 'failed',
                    error: 'Validation Error',
                    message: 'Role is missing'
                });
            }

            // Default validation error
            return res.status(400).json({
                status: 'failed',
                error: 'Validation Error',
                message: 'Invalid parameters'
            });
        });

    } catch (error) {
        console.error('saveUserController error:', error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});

/**
 * Get speaker credentials for a user
 */
export const getSpeakerController = catchAsyncError(async (req, res, next) => {
    try {
        const { body } = req;
        
        if (!body || Object.keys(body).length === 0) {
            return next(new ErrorHandler("Request body is required", 400));
        }

        const response = await getSpeakerCredentials(body);
        
        if (!response) {
            return next(new ErrorHandler("Failed to get speaker credentials", 500));
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('getSpeakerController error:', error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});

/**
 * Delete speaker credentials
 */
export const deleteSpeakerController = catchAsyncError(async (req, res, next) => {
    try {
        const { body } = req;
        
        if (!body || Object.keys(body).length === 0) {
            return next(new ErrorHandler("Request body is required", 400));
        }

        const response = await deleteSpeakerCredentials(body);
        
        if (!response) {
            return next(new ErrorHandler("Failed to delete speaker credentials", 500));
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('deleteSpeakerController error:', error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});

/**
 * Update speaker status
 */
export const updateStatusController = catchAsyncError(async (req, res, next) => {
    try {
        const eventUserID = req.params.id;
        const { body } = req;

        if (!eventUserID) {
            return next(new ErrorHandler("Event user ID is required", 400));
        }

        if (!body || Object.keys(body).length === 0) {
            return next(new ErrorHandler("Request body is required", 400));
        }

        // Check if event user exists
        const eventUserData = await EventUsersModel.findById(eventUserID);
        if (!eventUserData) {
            return next(new ErrorHandler("No users details found", 404));
        }

        // Validate required fields
        if (!body.speaker_id || body.speaker_id.trim() === "") {
            return res.status(400).json({
                status: 'error',
                inputs_received: body,
                message: { speaker_id: "The speaker id field is required" }
            });
        }

        if (!body.status || body.status.trim() === "") {
            return res.status(400).json({
                status: 'error',
                inputs_received: body,
                message: { status: "The status field is required" }
            });
        }

        // First, disable all speakers for this user
        await SpeakerUser.updateMany(
            { user_id: eventUserID }, 
            { $set: { speaker_status: "disabled" } }
        );

        // Find and update the specific speaker
        const speakerData = await SpeakerUser.findById(body.speaker_id);
        if (!speakerData) {
            return res.status(404).json({
                status: 'error',
                message: 'Speaker not found'
            });
        }

        // Update speaker status
        speakerData.speaker_status = body.status.trim().toLowerCase();
        const result = await speakerData.save();

        return res.status(200).json({
            status: 'success',
            message: 'Successfully updated',
            result: result
        });

    } catch (error) {
        console.error('updateStatusController error:', error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});



/**
 * Update speaker credentials
 */
export const updateSpeakerController = catchAsyncError(async (req, res, next) => {
    try {
        const { body } = req;
        
        if (!body || Object.keys(body).length === 0) {
            return next(new ErrorHandler("Request body is required", 400));
        }

        // Validate required fields for update
        if (!body.speaker_id || body.speaker_id.trim() === "") {
            return res.status(400).json({
                status: 'failed',
                error: 'Validation Error',
                message: 'Speaker ID is required for update'
            });
        }

        // Use the existing saveSpeakerDetails service which handles both create and update
        const userDetails = {
            body: body,
            file: req.file || null,
            user_id: body.user_id || null
        };

        const response = await saveSpeakerDetails(userDetails);
        
        if (!response) {
            return next(new ErrorHandler("Failed to update speaker credentials", 500));
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error('updateSpeakerController error:', error);
        return next(new ErrorHandler("Internal server error", 500));
    }
});