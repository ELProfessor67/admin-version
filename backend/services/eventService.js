import "dotenv/config"
import SessionModel from "@/models/sessionModel.js";
import moment from "moment";
import EventUsersModel from "@/models/eventUserModel";
import RoomPropertyModel from "@/models/roomPropertyModel.js"
import EventModel from "@/models/eventModel.js";
import RoomModel from "@/models/roomModel.js";
import InterpreterModel from "@/models/interpreterModel.js";
import LanguageModel from "@/models/languageModel.js";
import EventLanguageModel from "@/models/eventLanguageModel.js";
import EventFilesModel from "@/models/eventFilesModel.js";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { opentok } from "@/services/openTokService.js";
import { s3AWSBucket } from "@/services/AWSService.js";
import xlnode from "excel4node";
import { toHHMMSS } from "@/processor/events/toHHMMSSProcessor";
import eventModel from "@/models/eventModel.js";
import { createDirectoryStructure } from "@/processor/events/createDirectoryStructure";
import { fileUploadMiddleware } from "@/middlewares/multerMiddleware";
import { createErrorResponse } from "@/processor/events/createErrorResponseProcessor";
import { processFileUpload } from "@/processor/events/mediaUploadProcessor";
import { removeEventUsers } from "@/processor/events/removeEventUsersProcessor";
import { parseArgs } from "util";
const __dirname = path.resolve();

export const checkEventUserDetailsExists = async (params) => {
    try {
        const data = await EventUsersModel.find(params).exec();
        return {
            status: "success",
            data: data
        };
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
}

export const saveEventUserDetails = async (params) => {
    try {
        let startTime = moment().format();
        params.start_time = startTime;
        let endTime = moment(startTime).add(30, 's').format()
        params.end_time = endTime;

        const eventUsers = new EventUsersModel(params);
        const response = await eventUsers.save();
        
        return {
            status: "success",
            message: "Added successfully",
            data: response
        };
    } catch (error) {
        return {
            status: "error",
            error: error
        };
    }
}
//Save Event Details
export const saveEvent = async (params) => {
    try {
        const event = new EventModel(params);
        const response = await event.save();
       
        
        const eventID = response._id;
        const basePath = path.resolve(__dirname, '../uploads');
        
        // Create main event folder
      
        fs.mkdirSync(`${basePath}/${eventID}`, { recursive: true });
        
       
        // Define folders to create
        const folders = [
            'coverimage',
            'logoimage',
            'lobbyresource',
            'loginPageBg',
            'landingPageBg',
            'conferencePageBg',
            'eventMaterial',
            'event_files',
            'user_logo'
        ];
        
      
        // Create all folders concurrently
        
            folders.map(folder => 
                fs.mkdirSync(`${basePath}/${eventID}/${folder}`, { recursive: true })
            )
        

        
        
        return {
            status: 200,
            result: response
        };
    } catch (error) {
        console.log("error", error)
        return {
            status: false,
            error: error,
            message: 'Event creation failed'
        };
    }
};

export const getAllEvents = async (params) => {
    try {
        let eventFilter = "";
        if (params.user_id !== undefined) {
            eventFilter =
                eventFilter = {
                    "user_id": { $eq: params.user_id },
                    "finish": { $eq: params.finish }
                }
        }
        if (params.event_code !== undefined) {
            eventFilter =
                eventFilter = {
                    "event_code": { $eq: params.event_code },
                    "finish": { $eq: params.finish }
                }
        }
        const event = await EventModel.find(eventFilter)
            .sort({ createdAt: 'desc' })
            .exec();

        return {
            status: true,
            data: event
        }
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'No meeting available'
        }
    }
}

export const getEventRooms = async (params) => {
    try {
        const rooms = await RoomModel.find({ "event_id": { $eq: params.event_id } })
            .sort({ createdAt: 'asc' })
            .exec();

        return {
            status: true,
            data: rooms
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'No rooms available'
        };
    }
};

export const getEventAgenda = async (params) => {
    try {
        let eventFilter = {
            "room": { $eq: params.room }
        };

        // Add private filter if provided
        if (params.private !== undefined && params.private !== null && params.private !== "") {
            eventFilter.private = { $eq: params.private };
        }

        const sessions = await SessionModel.find(eventFilter)
            .sort({ start_date_time: 'asc' })
            .exec();

        return {
            status: true,
            data: sessions
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'No agenda available'
        };
    }
};

export const checkEventCode = async (code) => {
    try {
        const event = await EventModel.find({ event_code: code }).exec();

        return {
            status: true,
            data: event
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Event code verification failed'
        };
    }
};

export const deleteEvent = async (id) => {
    try {
        if (id === null || id === undefined) {
            return {
                status: false,
                error: 'Invalid ID',
                message: 'Event ID is required'
            };
        }

        const result = await EventModel.deleteOne({ _id: id }).exec();

        return {
            status: true,
            data: result
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Event deletion failed'
        };
    }
};

export const deleteEventUser = async (id) => {
    try {
        if (id === null || id === undefined) {
            return {
                status: false,
                error: 'Invalid ID',
                message: 'Event user ID is required'
            };
        }

        const result = await EventUsersModel.deleteOne({ _id: id }).exec();

        return {
            status: true,
            data: result
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Event user deletion failed'
        };
    }
};


export const updateEvent = async (params) => {
    try {
        if (!params._id) {
            return {
                status: false,
                error: 'Invalid ID',
                message: 'Event ID is required'
            };
        }

        const event = await EventModel.findById(params._id).exec();
        
        if (!event) {
            return {
                status: false,
                error: 'Event not found',
                message: 'Event does not exist'
            };
        }

        // Define updatable fields
        const updatableFields = [
            'name', 'address', 'testEvent', 'repeatWeekly', 'date', 'start_time', 
            'end_time', 'start_date_time', 'description', 'cover_image', 'logo_image',
            'lobby_resource', 'login_page_bg', 'landing_page_bg', 'conference_page_bg',
            'finish', 'useDefault', 'streamOut', 'speakerUserList', 'enableDownloadPpt',
            'enableHighResolution', 'enableSecondaryModerator', 'enableMasterSpeaker',
            'translationAI', 'disableChat', 'disablePublicCL', 'disablePublicCS',
            'disablePrivateCL', 'disablePrivateCS', 'enablePopupNot', 'signLanguageMode',
            'recording', 'password'
        ];

        // Update fields if they exist and are not empty
        updatableFields.forEach(field => {
            if (params[field] !== undefined && params[field] !== "") {
                event[field] = params[field];
            }
        });

        // Handle special description case (can be empty)
        if (params.description !== undefined) {
            event.description = params.description;
        }

        // Handle special password case (can be empty)
        if (params.password !== undefined) {
            event.password = params.password;
        }

        // Handle delete operations for image fields
        const deleteFields = ['logo_image', 'lobby_resource', 'login_page_bg', 'landing_page_bg', 'conference_page_bg'];
        deleteFields.forEach(field => {
            if (params[field] === 'delete') {
                event[field] = '';
            }
        });

        const updatedEvent = await event.save();

        return {
            status: true,
            data: updatedEvent
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Event update failed'
        };
    }
};



export const getSessionDetails = async (params) => {
    try {
        // Validate required parameters
        if (!params.session_id) {
            return {
                status: "error",
                error: 'Invalid session id',
                message: 'Session ID is required'
            };
        }

        if (!params.role) {
            return {
                status: "error",
                error: 'Invalid user',
                message: 'User role is required'
            };
        }

        if (!params.userId) {
            return {
                status: "error",
                error: 'User ID is required',
                message: 'User ID is required'
            };
        }

        // Validate role
        const roleTypes = ["moderator", "speaker", "listener", "interpreter"];
        if (!roleTypes.includes(params.role)) {
            return {
                status: false,
                error: 'Invalid user',
                message: 'Invalid user role'
            };
        }

        // Get session details
        const session = await SessionModel.findById(params.session_id)
            .populate('room')
            .populate('event_id')
            .exec();

        if (!session) {
            return {
                status: "error",
                error: 'No Session available',
                message: 'Session not found'
            };
        }

        // Build image URLs
        const uploadDomain = process.env.UPLOAD_DOMAIN;
        let eventLogoImage = process.env.DEFAULT_EVENT_LOGO;
        let eventCoverImage = [];

        if (session.event_id.useDefault === false || session.event_id.useDefault === "false") {
            if (session.event_id.logo_image) {
                eventLogoImage = uploadDomain + session.event_id.logo_image;
            }

            if (session.event_id.cover_image?.length > 0) {
                eventCoverImage = session.event_id.cover_image
                    .filter(img => img)
                    .map(img => uploadDomain + img);
            }
        }

        // Build background URLs
        const buildUrl = (path) => path ? uploadDomain + path : '';
        const lobbyResourceUrl = buildUrl(session.event_id.lobby_resource);
        const loginPageBgUrl = buildUrl(session.event_id.login_page_bg);
        const landingPageBgUrl = buildUrl(session.event_id.landing_page_bg);
        const conferencePageBgUrl = buildUrl(session.event_id.conference_page_bg);

        // Build response object
        let response = {
            session_id: session.session_id,
            session_name: session.name,
            session_date: session.start_date_time,
            session_start_date: session.start_time,
            session_end_time: session.end_time,
            session_private: session.private,
            session_floor_title: session.floor_title,
            event_name: session.event_id.name,
            event_address: session.event_id.address,
            event_description: session.event_id.description,
            event_code: session.event_id.event_code,
            streaming_out: session.event_id.streamOut,
            speakerUserList: session.event_id.speakerUserList,
            enableDownloadPpt: session.event_id.enableDownloadPpt,
            enableHighResolution: session.event_id.enableHighResolution,
            enableSecondaryModerator: session.event_id.enableSecondaryModerator,
            enableMasterSpeaker: session.event_id.enableMasterSpeaker,
            translationAI: session.event_id.translationAI,
            disableChat: session.event_id.disableChat,
            disablePublicCL: session.event_id.disablePublicCL,
            disablePublicCS: session.event_id.disablePublicCS,
            disablePrivateCL: session.event_id.disablePrivateCL,
            disablePrivateCS: session.event_id.disablePrivateCS,
            enablePopupNot: session.event_id.enablePopupNot,
            recording_enabled: session.event_id.recording || false,
            signlanguagemode_enabled: session.event_id.signLanguageMode || false,
            event_logo_image: eventLogoImage,
            lobby_resource_url: lobbyResourceUrl,
            login_page_bg: loginPageBgUrl,
            landing_page_bg: landingPageBgUrl,
            conference_page_bg: conferencePageBgUrl,
            event_cover_image: eventCoverImage,
            event_date: session.event_id.start_date_time,
            event_start_date: session.event_id.start_time,
            event_end_date: session.event_id.end_time,
            event_id: session.event_id._id,
            room_name: session.room.name
        };

        // Generate tokens
        const tokenOptions = {
            role: 'moderator',
            expireTime: (new Date().getTime() / 1000) + (30 * 24 * 60 * 60),
            initialLayoutClassList: ['focus']
        };
        response.publisher_token = opentok.generateToken(session.session_id, tokenOptions);

        //start caption
        // after you build `response` (and generate a moderator token)
        // const captionsToken = response.publisher_token; // you set role:'moderator' above

        // // Only start if not already running (optional but recommended)
        // if (!session.captions_id) {
        //     const options = {
        //         languageCode: 'hi-IN',
        //         partialCaptions: true,
        //         maxDuration: 4 * 60 * 60
        //     };

        //     opentok.startCaptions(
        //         session.session_id,
        //         captionsToken,
        //         options,
        //         async (err, res) => {
        //         if (err) {
        //             console.error('startCaptions failed:', err);
        //             return; // don’t block the rest of the response
        //         }
        //         // Persist the captionsId so you can stop later
        //         session.captions_id = res;
        //         await session.save();
        //         console.log('Captions started:', res);
        //         }
        //     );
        // }





        if (params.role === 'listener') {
            const listenerTokenOptions = {
                role: 'subscriber',
                expireTime: (new Date().getTime() / 1000) + (30 * 24 * 60 * 60),
                initialLayoutClassList: ['focus']
            };
            response.listener_token = opentok.generateToken(session.session_id, listenerTokenOptions);
        }

        // Get user language
        const eventUsers = await EventUsersModel.find({
            "event_id": session.event_id._id,
            "_id": params.userId
        }).exec();

        let userSelectedLanguage = '';
        if (eventUsers?.length > 0) {
            const language = eventUsers[0].language;
            if (language && !['floor', 'Floor', 'Original'].includes(language)) {
                userSelectedLanguage = language;
            }
        }
        response.selected_language = userSelectedLanguage;

        // Get interpreting languages
        const interpreters = await InterpreterModel.find({ "session": params.session_id })
            .populate('from')
            .populate('to')
            .exec();

        let interpretingLanguages = [];
        if (interpreters?.length > 0) {
            interpreters.forEach(interpreter => {
                if (interpreter.from?.title && !interpretingLanguages.includes(interpreter.from.title)) {
                    interpretingLanguages.push(interpreter.from.title);
                }
                if (interpreter.to?.title && !interpretingLanguages.includes(interpreter.to.title)) {
                    interpretingLanguages.push(interpreter.to.title);
                }
            });
        }
        response.interpreting_languages = interpretingLanguages;

        // Handle interpreter-specific data
        if (params.role === 'interpreter') {
            const userInterpreter = await InterpreterModel.findOne({
                "session": params.session_id,
                "_id": params.userId
            })
            .populate('from')
            .populate('to')
            .exec();

            if (!userInterpreter) {
                return {
                    status: "error",
                    error: 'Interpreter not assigned to the session',
                    message: 'Interpreter details not available'
                };
            }

            response.interpreter_to_language = userInterpreter.to?.title || "";
            response.interpreter_from_language = userInterpreter.from?.title || "";
            response.interpreter_two_way_allowed = userInterpreter.two_way;
            response.show_interpreter_video = userInterpreter.show_video || false;
        }
        response.captions_id = session.captions_id;

        return {
            status: "success",
            data: response
        };
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'Failed to get session details'
        };
    }
};

export const toggleCaption = async (params) => {
    try {
        if (!params.session_id || !params.status) {
            return {
                status: "error",
                error: "Invalid parameters",
                message: "Session ID and status are required"
            };
        }

        if (!params.token && params.status === "start") {
            return {
                status: "error",
                error: "Invalid parameters",
                message: "Token is required"
            };
        }

        if (!params.language && params.status === "start") {
            return {
                status: "error",
                error: "Invalid parameters",
                message: "Language is required"
            };
        }

        const session = await SessionModel.findById(params.session_id).exec();
        if (!session) {
            return {
                status: "error",
                error: "Session not found",
                message: "Session not found"
            };
        }

        if(params.status === "start") {
            if (!session.captions_id) {
                const options = {
                    languageCode: params.language,
                    partialCaptions: true,
                    maxDuration: 4 * 60 * 60
                };

                opentok.startCaptions(
                    session.session_id,
                    params.token,
                    options,
                    async (err, res) => {
                        if (err) {
                            console.error('startCaptions failed:', err);
                            return; // don’t block the rest of the response
                        }
                        // Persist the captionsId so you can stop later
                        session.captions_id = res;
                        await session.save();
                        console.log('Captions started:', res);
                    }
                    );
            }
        }else{
            if(session.captions_id){
                opentok.stopCaptions(session.captions_id, async (err) => {
                    if (err) {
                      console.error("stopCaptions failed:", err);
                    } else {
                      console.log("Captions stopped successfully");
                    }
                    session.captions_id = null;
                    await session.save();
                  });

            }
        }

        return {    
            status: "success",
            message: `${params.status === "start" ? "Captions started" : "Captions stopped"}`,
            data: session.captions_id
        };
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: "Failed to start captions"
        };
    }
}

export const getEventByID = async (id) => {
    try {
        const event = await EventModel.findById(id).exec();

        return {
            status: true,
            data: event
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Event not found'
        };
    }
};

export const checkEmailID = async (params) => {
    try {
        const interpreter = await InterpreterModel.findOne(params).exec();

        return {
            status: true,
            data: interpreter
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Email check failed'
        };
    }
};

export const getRoomDetails = async (params) => {
    try {
        const sessions = await SessionModel.find({ "_id": { $in: params.session_id } })
            .sort({ createdAt: 'asc' })
            .exec();

        return {
            status: true,
            data: sessions
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Room details not found'
        };
    }
};

export const getSessions = async (params) => {
    try {
        const sessions = await SessionModel.find({ "event_id": { $in: params.event_id } })
            .sort({ createdAt: 'asc' })
            .exec();

        return {
            status: true,
            data: sessions
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Sessions not found'
        };
    }
};



export const getUserStreamReport = async (params) => {
    try {
        const users = await EventUsersModel.find({ "event_id": { $in: params.event_id } })
            .sort({ createdAt: 'asc' })
            .exec();

        return {
            status: true,
            data: users
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'User stream report not found'
        };
    }
};

export const getRoomProperty = async (params) => {
    try {
        if (!params.session_id) {
            return {
                status: false,
                error: 'Invalid session id',
                message: 'The session id field is required'
            };
        }

        const roomProperty = await RoomPropertyModel.findOne({ 'session_id': params.session_id }).exec();

        return {
            status: true,
            data: roomProperty
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Room property not found'
        };
    }
};

export const saveRoomProperty = async (params) => {
    try {
        if (!params.sessionId) {
            return {
                status: false,
                error: 'Invalid Parameters',
                message: 'Session ID is required'
            };
        }

        const payload = { 
            session_id: params.sessionId, 
            property: params.property 
        };

        const roomProperty = await RoomPropertyModel.findOneAndUpdate(
            { session_id: params.sessionId }, 
            payload, 
            { upsert: true, new: true }
        ).exec();

        return {
            status: true,
            data: roomProperty,
            message: 'Saved successfully'
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Failed to save room property'
        };
    }
};

export const saveEventEndTime = async (params) => {
    try {
        // Validate parameters
        if (!params || Object.keys(params).length === 0) {
            return {
                status: false,
                error: 'Invalid Parameters',
                message: 'Parameters are required'
            };
        }

        if (!params.user_id) {
            return {
                status: false,
                error: 'user_id is mandatory',
                message: 'User ID is required'
            };
        }

        // Find and update user
        const eventUser = await EventUsersModel.findById(params.user_id).exec();

        if (!eventUser) {
            return {
                status: false,
                error: 'User not Existing',
                message: 'User not found'
            };
        }

        eventUser.end_time = moment().format();
        await eventUser.save();

        return {
            status: true,
            message: 'Successfully Updated Event End Time'
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Failed to update event end time'
        };
    }
};

export const startArchive = async (params) => {
    try {
        // Validate required parameters
        const requiredFields = ['event_id', 'session_id', 'outputMode'];
        const missingFields = {};

        requiredFields.forEach(field => {
            if (!params[field]) {
                missingFields[field] = `The ${field.replace('_', ' ')} field is required`;
            }
        });

        if (Object.keys(missingFields).length > 0) {
            return {
                status: false,
                error: missingFields,
                message: 'Required fields missing'
            };
        }

        // Prepare archive options
        const archiveOptions = {
            name: params.name || "",
            outputMode: params.outputMode
        };

        // Start archive using OpenTok
        const archive = await new Promise((resolve, reject) => {
            opentok.startArchive(params.session_id, archiveOptions, (err, archive) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(archive);
                }
            });
        });

        // Save archive to event
        try {
            const event = await EventModel.findById(params.event_id).exec();
            if (event) {
                if (Array.isArray(event.archives) && event.archives.length > 0) {
                    event.archives.push(archive);
                } else {
                    event.archives = [archive];
                }
                await event.save();
            }
        } catch (saveError) {
            // Archive started successfully, but saving to event failed
            // This is not critical, so we don't fail the entire operation
            console.error('Failed to save archive to event:', saveError);
        }

        return {
            status: true,
            data: archive
        };
    } catch (error) {
        return {
            status: false,
            error: error,
            message: 'Failed to start archive'
        };
    }
};



export const stopArchive = async (params) => {
    try {
        if (params.archive_id !== undefined && params.archive_id !== null && params.archive_id !== "") {
            
            const archive = await new Promise((resolve, reject) => {
                opentok.stopArchive(params.archive_id, function (err, archive) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(archive);
                    }
                });
            });

            return {
                status: "success",
                data: archive
            };
        } else {
            let errorMessage = {};

            if (params.archive_id === undefined || params.archive_id === null || params.archive_id === "") {
                errorMessage['archive_id'] = "The archive id field is required";
            }

            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
}


export const savePPTFile = async (params) => {
    try {
        if (params.event_id !== undefined && params.event_id !== null && params.event_id !== "" &&
            params.title !== undefined && params.title !== null && params.title !== ""
        ) {
            params.title = params.title.trim();

            const eventData = await EventModel.findById(params.event_id).exec();
            
            if (eventData == null) {
                let response = {
                    status: 'failed',
                    error: 'No records found',
                    message: 'No event details found'
                };
                return {
                    status: "error",
                    error: 'No records found',
                    message: response
                };
            }
            
            const eventFiles = new EventFilesModel(params);
            const response = await eventFiles.save();
            
            return {
                status: "success",
                result: response
            };
        } else {
            let errorMessage = {};

            if (params.event_id === undefined || params.event_id === null || params.event_id === "") {
                errorMessage['event_id'] = "The event id field is required";
            }
            if (params.title === undefined || params.title === null || params.title === "") {
                errorMessage['title'] = "The title field is required";
            }

            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'PPT file save failed'
        };
    }
}

export const saveEventFile = async (params) => {
    try {
        if (params.event_id !== undefined && params.event_id !== null && params.event_id !== "" &&
            params.title !== undefined && params.title !== null && params.title !== "" &&
            params.url !== undefined && params.url !== null && params.url !== ""
        ) {
            // const urlExist = require("url-exist");
            // let exists = await urlExist(params.url);

            params.title = params.title.trim();

            if (params.type === undefined || params.type === null || params.type === "") {
                let extension = (params.url).split(/[#?]/)[0].split('.').pop().trim();

                if (extension !== "") {
                    extension = extension.toLowerCase();
                }
                if (extension !== "mp4" && extension !== "mp3" && extension !== "ppt" && extension !== "pptx" && extension !== "html") {
                    params.type = "url";
                } else if (extension === "html") {
                    params.type = "ppt";
                } else {
                    params.type = extension;
                }
            }

            var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            if (pattern.test(params.url)) {
                // if (exists === true) {
                const eventData = await EventModel.findById(params.event_id).exec();
                
                if (eventData == null) {
                    let response = {
                        status: 'failed',
                        error: 'No records found',
                        message: 'No event details found'
                    };
                    return {
                        status: "error",
                        error: 'No records found',
                        message: response
                    };
                }
                
                const eventFiles = new EventFilesModel(params);
                const response = await eventFiles.save();
                
                return {
                    status: "success",
                    result: response
                };
            } else {
                let response = {
                    status: 'error',
                    message: 'Invalid URL'
                };
                return {
                    status: "error",
                    message: response
                };
            }
        } else {
            let errorMessage = {};

            if (params.event_id === undefined || params.event_id === null || params.event_id === "") {
                errorMessage['event_id'] = "The event id field is required";
            }
            if (params.title === undefined || params.title === null || params.title === "") {
                errorMessage['title'] = "The event file title field is required";
            }

            if (params.url === undefined || params.url === null || params.url === "") {
                errorMessage['url'] = "The event file url field is required";
            }

            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'Event file save failed'
        };
    }
}

export const eventFilesList = async (params) => {
    try {
        if (params.event_id !== undefined && params.event_id !== null && params.event_id !== "") {
            const eventFilter = {
                "event_id": { $eq: params.event_id },
                "is_deleted": { $eq: false }
            };
            
            const data = await EventFilesModel.find(eventFilter)
                .sort({ createdAt: 'desc' })
                .exec();

            return {
                status: "success",
                data: data
            };
        } else {
            let errorMessage = {};

            if (params.event_id === undefined || params.event_id === null || params.event_id === "") {
                errorMessage['event_id'] = "The event id field is required";
            }

            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'No Event files available'
        };
    }
}


export const deleteEventFile = async (params) => {
    try {
        if (params.event_file_id !== undefined && params.event_file_id !== null && params.event_file_id !== "") {
            const eventData = await EventFilesModel.findById(params.event_file_id).exec();
            
            if (eventData == null) {
                return {
                    status: "error",
                    error: 'Event file not found',
                    message: 'Event file not found'
                };
            }
            
            eventData.status = 0;
            eventData.is_deleted = 1;
            await eventData.save();
            
            return {
                status: "success",
                message: "Successfully deleted"
            };
        } else {
            let errorMessage = {};

            if (params.event_file_id === undefined || params.event_file_id === null || params.event_file_id === "") {
                errorMessage['event_file_id'] = "The event file id field is required";
            }

            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'Event file deletion failed'
        };
    }
}

export const updateSelectedLanguage = async (params) => {
    try {
        if (Object.keys(params).length !== 0 && params.user_id !== undefined && params.user_id !== "") {
            const data = await EventUsersModel.findOne({ '_id': params.user_id }).exec();
            
            if (data !== null) {
                data.language = params.language;
                await data.save();
                
                return {
                    status: "success",
                    message: "Successfully Updated Language"
                };
            } else {
                return {
                    status: 'failed',
                    body: params,
                    error: 'User not Existing'
                };
            }
        } else if (Object.keys(params).length === 0) {
            return {
                status: 'failed',
                body: params,
                error: 'Invalid Parameters'
            };
        } else if (params.user_id === undefined || params.user_id === "") {
            return {
                status: 'failed',
                body: params,
                error: 'user_id is mandatory'
            };
        }
    } catch (error) {
        return {
            status: 'failed',
            body: params,
            error: error
        };
    }
}

export const updateConversionStatus = async (params) => {
    try {
        if (Object.keys(params).length !== 0 && params.room !== undefined && params.room !== "" &&
            params.status !== undefined && params.status !== "" &&
            params.fileName !== undefined && params.fileName !== "") {
            
            const eventData = await EventFilesModel.findById(params.room).exec();
            
            if (eventData == null) {
                return {
                    status: "error",
                    error: 'Event file not found',
                    message: 'Event file not found'
                };
            }
            
            eventData.status = params.status !== undefined ? params.status : 'failed';
            eventData.converted_status = params.status === 'success' ? 1 : 0;
            eventData.fileName = params.fileName;
            await eventData.save();
            
            return {
                status: "success",
                message: "Successfully updated"
            };
        } else if (Object.keys(params).length === 0) {
            return {
                status: 'failed',
                body: params,
                error: 'Invalid Parameters'
            };
        } else if (params.room === undefined || params.room === "") {
            return {
                status: 'failed',
                body: params,
                error: 'room is mandatory'
            };
        } else if (params.status === undefined || params.status === "") {
            return {
                status: 'failed',
                body: params,
                error: 'status is mandatory'
            };
        } else if (params.fileName === undefined || params.fileName === "") {
            return {
                status: 'failed',
                body: params,
                error: 'file name is mandatory'
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'Conversion status update failed'
        };
    }
}


export const eventDetails = async (params) => {
    try {
        if (params.event_code && params.user_name && params.user_email) {

            let eventFilter = {
                "event_code": { $eq: params.event_code },
                "finish": { $eq: true }
            }
            let data = [];
            try {
                data = await EventModel.find(eventFilter)
                    .sort({ createdAt: 'desc' }).exec();
            } catch (e) {
                return {
                    status: false,
                    error: e,
                    message: 'No meeting available'
                }
            }

            let eventDetails = {};
            if (data.length > 0 && data[0] !== undefined && data[0].id !== undefined) {
                eventDetails = data[0];
                let event_id = eventDetails.id;
                let eventLogoImage = "https://admin.rafikyconnect.net/logo-2-01.png";
                let eventCoverImage = [];

                if (eventDetails.useDefault === false || eventDetails.useDefault == "false") {
                    if (eventDetails.logo_image !== undefined && eventDetails.logo_image !== null && eventDetails.logo_image !== "") {
                        eventLogoImage = 'https://api.rafikyconnect.net/' + eventDetails.logo_image;
                    }

                    if (eventDetails.cover_image !== undefined && eventDetails.cover_image !== null && eventDetails.cover_image !== "" && eventDetails.cover_image.length > 0) {

                        for (var ci = 0; ci < eventDetails.cover_image.length; ci++) {
                            if (eventDetails.cover_image[ci] !== undefined && eventDetails.cover_image[ci] !== null && eventDetails.cover_image[ci] !== "") {
                                eventCoverImage.push('https://api.rafikyconnect.net/' + eventDetails.cover_image[ci]);
                            }
                        }
                    }
                }
                let eventResponse = {
                    event_id: eventDetails.id,
                    event_name: eventDetails.name,
                    event_address: eventDetails.address,
                    event_description: eventDetails.description,
                    event_date: eventDetails.date,
                    event_start_time: eventDetails.start_time,
                    event_end_time: eventDetails.end_time,
                    event_timezone: eventDetails.timezone,
                    event_logo_image: eventLogoImage,
                    event_cover_image: eventCoverImage,
                    languages: [],
                    rooms: []
                }
                
                let eventLanguages = []
                let languageData = [];
                try {
                    languageData = await EventLanguageModel.find({ "event_id": { $eq: event_id } })
                        .populate('language_id')
                        .sort({ createdAt: 'asc' }).exec();
                } catch (e) {
                    return {
                        status: "success",
                        data: eventResponse
                    }
                }


                if (languageData.length > 0) {
                    for (var ld = 0; ld < languageData.length; ld++) {
                        eventLanguages.push({
                            name: languageData[ld].title,
                            id: languageData[ld].id,
                            flag: languageData[ld].language_id?.flag || null
                        })

                        if (languageData.length === (ld + 1)) {
                            eventResponse.languages = eventLanguages;
                        }
                    }
                }
                let roomData = []
                try {
                    roomData = await RoomModel.find({ "event_id": { $eq: event_id } })
                        .sort({ createdAt: 'asc' }).exec();
                } catch (e) {
                    return {
                        status: "success",
                        data: eventResponse
                    }
                }
                if (roomData.length > 0) {
                    let allRooms = []
                    for (let rr = 0; rr < roomData.length; rr++) {
                        let roomID = roomData[rr].id;
                        let roomDetails = {
                            room_name: roomData[rr].name,
                            room_id: roomData[rr].id,
                            sessions: []
                        };
                        let sessions = []
                        try {
                            sessions = await SessionModel.find({ "room": { $eq: roomID } }).exec();
                        } catch (error) {
                            allRooms.push(roomDetails);
                            if (roomData.length === rr + 1 && sessions.length === 0) {
                                eventResponse.rooms = allRooms;
                                return {
                                    status: "success",
                                    data: eventResponse
                                }
                            }
                        }
                        if (sessions !== null && sessions !== undefined && sessions !== "" && sessions.length > 0) {
                            for (var ss = 0; ss < sessions.length; ss++) {
                                let response = {
                                    opentok_session_id: sessions[ss].session_id,
                                    session_id: sessions[ss].id,
                                    session_name: sessions[ss].name,
                                    session_date: sessions[ss].start_date_time,
                                    session_start_time: sessions[ss].start_time,
                                    session_end_time: sessions[ss].end_time,
                                    session_private: sessions[ss].private,
                                    session_floor_title: sessions[ss].floor_title,
                                }

                                var tokenOptions = {
                                    role: 'moderator',
                                    expireTime: (new Date().getTime() / 1000) + (30 * 24 * 60 * 60),
                                    initialLayoutClassList: ['focus']
                                };
                                response.opentok_publisher_token = opentok.generateToken(sessions[ss].session_id, tokenOptions);
                                var tokenOptions = {
                                    role: 'subscriber',
                                    expireTime: (new Date().getTime() / 1000) + (30 * 24 * 60 * 60),
                                    initialLayoutClassList: ['focus']
                                };
                                response.opentok_listener_token = opentok.generateToken(sessions[ss].session_id, tokenOptions);
                                roomDetails.sessions.push(response);
                                allRooms.push(roomDetails);
                                if (roomData.length === rr + 1 && sessions.length === ss + 1) {
                                    eventResponse.rooms = allRooms;
                                    return {
                                        status: "success",
                                        data: eventResponse
                                    }
                                }
                            }
                        } else {
                            allRooms.push(roomDetails);
                            if (roomData.length === rr + 1 && sessions.length === 0) {
                                eventResponse.rooms = allRooms;
                                return {
                                    status: "success",
                                    data: eventResponse
                                }
                            }
                        }

                    }
                } else {
                    return {
                        status: "success",
                        data: eventResponse
                    }
                }
            } else {
                return {
                    status: "error",
                    error: err,
                    message: 'No event available'
                }
            }

        } else {
            let errorMessage = {};

            if (params.event_code === undefined || params.event_code === null || params.event_code === "") {
                errorMessage['event_code'] = "The event code field is required";
            }
            if (params.user_name === undefined || params.user_name === null || params.user_name === "") {
                errorMessage['user_name'] = "The user name field is required";
            }
            if (params.user_email === undefined || params.user_email === null || params.user_email === "") {
                errorMessage['user_email'] = "The user email field is required";
            }
            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            }
        }
    } catch (error) {
        return {
            status: false,
            error: err,
            message: 'Something went wrong; Please try again'
        }
    }
}

export const saveEventUser = async (params) => {
    try {
        if (params.name && params.email && params.role && params.event_id) {
            

            let startTime = moment().format();
            params.start_time = startTime;
            let endTime = moment(startTime).add(30, 's').format()
            params.end_time = endTime;
            params.email = params.email.toLowerCase();
            params.role = params.role.toLowerCase();

            let userFilter = {
                "event_id": { $eq: params.event_id },
                "email": { $eq: params.email }
            };
            
            const data = await EventUsersModel.find(userFilter).exec();
            
            if (data !== undefined && data !== null && data !== "" && data.length > 0) {
                return {
                    status: "success",
                    data: data[0]
                };
            } else {
                const eventUsers = new EventUsersModel(params);
                const response = await eventUsers.save();
                
                return {
                    status: "success",
                    data: response
                };
            }
        } else {
            let errorMessage = {};

            if (params.name === undefined || params.name === null || params.name === "") {
                errorMessage['name'] = "The user name field is required";
            }
            if (params.email === undefined || params.email === null || params.email === "") {
                errorMessage['email'] = "The user email field is required";
            }
            if (params.role === undefined || params.role === null || params.role === "") {
                errorMessage['role'] = "The role field is required";
            }
            if (params.event_id === undefined || params.event_id === null || params.event_id === "") {
                errorMessage['event_id'] = "The event id field is required";
            }
            if (params.language === undefined || params.language === null || params.language === "") {
                errorMessage['language'] = "The language field is required";
            }
            
            return {
                status: "error",
                inputs_received: params,
                message: errorMessage
            };
        }
    } catch (error) {
        return {
            status: "error",
            error: error,
            message: 'Event user save failed'
        };
    }
}

export const updateEventUserDetails = async (params) => {
    try {
        if (params.id !== undefined && params.id !== null && params.id !== "") {
            const data = await EventUsersModel.findOne({ '_id': params.id }).exec();
            
            if (data !== null) {
                data.name = params.name;
                await data.save();
                
                return {
                    status: true,
                    error: false,
                    data: data
                };
            } else {
                return {
                    status: true,
                    error: 'User not found',
                    data: null
                };
            }
        } else {
            return {
                status: false,
                error: 'Invalid ID parameter'
            };
        }
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
}






export const downloadStreamReport = async (eventId, res) => {
    const wb = new xlnode.Workbook();
    const ws = wb.addWorksheet('SHEET_NAME');
    // Create a reusable style
    const style = wb.createStyle({
        font: {
            size: 13,
            color: '#FFFFFF',
        },
        fill: { // §18.8.20 fill (Fill)
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#871fff',
            fgColor: '#871fff'
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });
    try {
        if (eventId) {
            let userReport = await eventController.getUserStreamReport({ event_id: eventId });
            let eventDetails = await eventController.getEventByID(eventId);
            if (eventDetails) {
                ws.cell(1, 1).string('Name ' + eventDetails.data.name);
                ws.cell(2, 1).string('Code ' + eventDetails.data.event_code);
                ws.cell(3, 1).string('Time ' + eventDetails.data.start_time + ' to ' + eventDetails.data.end_time);
                ws.cell(5, 1).string('User').style(style);
                ws.cell(5, 2).string('Email').style(style);
                ws.column(2).setWidth(30);
                ws.cell(5, 3).string('Role').style(style);
                ws.cell(5, 4).string('Start Time').style(style);
                ws.cell(5, 5).string('End Time').style(style);
                ws.cell(5, 6).string('Duration').style(style);
            }
            if (userReport) {
                const users = userReport.data;
                for (let i = 0; i < users.length; i++) {
                    const user = users[i];
                    const durationInSec = parseInt((new Date(user.end_time) - new Date(user.start_time)) / 1000);
                    const duration = toHHMMSS(durationInSec);
                    const row = i + 6;
                    ws.cell(row, 1).string(user.name);
                    ws.cell(row, 2).string(user.email);
                    ws.cell(row, 3).string(user.role);
                    ws.cell(row, 4).date(new Date(user.start_time));
                    ws.cell(row, 5).date(new Date(user.end_time));
                    ws.cell(row, 6).string(duration);
                }
            } else {
                ws.cell(5, 1).string('No stream report found');
            }

        } else {
            ws.cell(1, 1).string('No stream report found');
        }

    } catch (error) {
        ws.cell(1, 1).string('No stream report found');
    }
    wb.write(`Stream Report.xlsx`, res);
}


export const uploadFile = async (eventId, req, res) => {
    try {

        // Validate event ID
        if (!eventId) {
            return res.status(400).json({
                status: 'failed',
                error: 'Validation Error',
                message: 'Event parameter missing'
            });
        }

        // Verify event exists
        const eventData = await EventModel.findById(eventId).exec();

        if (!eventData) {
            return res.status(404).json({
                status: 'failed',
                error: 'No records found',
                message: 'No event details found'
            });
        }

        // Create directory structure
        await createDirectoryStructure(eventId);

        // Handle file upload with multer
        const eventArchieveUpload = fileUploadMiddleware("event_files", "event_file")
        eventArchieveUpload(req, res, async function (error) {
            if (error) {
                const errorResponse = createErrorResponse(error, 'Upload failed', eventId);
                return res.status(500).json(errorResponse);
            }

            // Process the uploaded file
            const result = await processFileUpload(req, eventId);

            const statusCode = result.status === 'success' ? 200 : 400;
            return res.status(statusCode).json(result);
        });

    } catch (error) {
        console.error('Upload function error:', error);
        return res.status(500).json({
            status: 'failed',
            error: 'Server Error',
            message: 'An unexpected error occurred'
        });
    }
}





export const uploadEventUsers = async (params) => {
    try {
        const data = await EventModel.findById(params._id).exec();
        
        if (data !== null) {
            let interpreter = await InterpreterModel.find({ "event_id": { $eq: params._id } }).exec();
            let interpreterError = [];
            let duplicateUser = []
            let commonErrorMsg = []
            let emailError = []
            let alreadyExistsUserError = []
            let type = params.type;
            let userList = params.user_list;
            let removeUsers = await removeEventUsers(params);

            if (userList !== null && userList !== undefined && userList.length > 0 && params.type !== undefined && params.type !== null && params.type !== "") {

                for (var ul = 0; ul < userList.length; ul++) {

                    let email = userList[ul].trim();
                    if (email !== undefined && email !== null && email !== "") {
                        email = email.toLowerCase()
                        let alreadyExists = interpreter.some(function (item) {
                            return item.email.toLowerCase() === email
                        });
                        if (alreadyExists === false) {
                            let userFilter = {
                                "event_id": { $eq: params._id },
                                "email": { $eq: email }
                            }
                            let eventUser = [];
                            eventUser = await EventUsersModel.find(userFilter).exec();
                            if (eventUser.length > 0) {

                                for (let eu = 0; eu < eventUser.length; eu++) {
                                    let users = eventUser[eu];
                                    if (users._id !== undefined && users.speaker_status === false && users.listener_status === false) {

                                        try {
                                            const userData = await EventUsersModel.findOne({ '_id': users._id }).exec();
                                            if (userData !== null) {
                                                userData.speaker_status = type === 'speaker' ? true : false;
                                                userData.listener_status = type === 'speaker' ? false : true;
                                                userData.back_end_user = true;
                                                userData.role = type === 'speaker' ? 'speaker' : 'listener';
                                                await userData.save();
                                            }
                                        } catch (error) {
                                            commonErrorMsg.push(email);
                                        }
                                    } else {
                                        alreadyExistsUserError.push(users);
                                    }
                                }
                            } else {
                                let userData = {
                                    email: email,
                                    role: type === 'speaker' ? 'speaker' : 'listener',
                                    speaker_status: type === 'speaker' ? true : false,
                                    listener_status: type === 'speaker' ? false : true,
                                    event_id: params._id,
                                    back_end_user: true
                                }
                                try {
                                    const event_user = new EventUsersModel(userData);
                                    await event_user.save();
                                } catch (error) {
                                    commonErrorMsg.push(email);
                                }
                            }

                        } else {
                            interpreterError.push(email);
                        }

                    } else {
                        emailError.push(email);
                    }
                }

                return {
                    status: true,
                    emailError: emailError,
                    interpreterError: interpreterError,
                    duplicateUser: duplicateUser,
                    commonErrorMsg: commonErrorMsg,
                    alreadyExistsUserError: alreadyExistsUserError,
                    removeUsers: removeUsers
                };
            } else {
                return {
                    status: true,
                    error: false
                };
            }
        } else {
            return {
                status: false,
                error: 'Event not found'
            };
        }
    } catch (error) {
        console.log(error);
        return {
            status: false,
            error: error
        };
    }
}