import SessionModel from '@/models/sessionModel.js';
import InterpreterModel from '@/models/interpreterModel.js';
import EventUsersModel from '@/models/eventUserModel.js';
import {opentok} from "@/services/openTokService.js";


/**
 * Session Service - Handles all session/agenda-related operations
 */

/**
 * Get sessions for a specific event
 * @param {Object} params - Parameters containing event_id
 * @returns {Promise<Object>} Result with status and data/error
 */
export const getEventSessions = async (params) => {
    try {
        if (!params || !params.event_id) {
            throw new Error('Event ID is required');
        }

        const sessions = await SessionModel.find({ event_id: params.event_id })
            .sort({ createdAt: 'asc' });

        return {
            status: true,
            data: sessions
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Update an existing session/agenda
 * @param {Object} params - Session parameters including _id
 * @returns {Promise<Object>} Result with status and data/error
 */
export const updateAgenda = async (params) => {
    try {
        if (!params || !params._id) {
            throw new Error('Session ID is required for update');
        }

        const session = await SessionModel.findById(params._id);
        if (!session) {
            throw new Error('Session not found');
        }

        // Update only provided fields
        const updateableFields = [
            'name', 'date', 'start_time', 'end_time', 
            'start_date_time', 'end_date_time', 'room', 
            'description', 'floor_title', 'private'
        ];

        updateableFields.forEach(field => {
            if (params[field] !== undefined && params[field] !== '') {
                session[field] = params[field];
            }
        });

        const updatedSession = await session.save();

        return {
            status: true,
            result: updatedSession
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Save a new session/agenda with OpenTok session creation
 * @param {Object} params - Session parameters
 * @returns {Promise<Object>} Result with status and data/error
 */
export const saveAgenda = async (params) => {
    try {
        if (!params) {
            throw new Error('Session parameters are required');
        }

        // Create OpenTok session
        const opentokSession = await createOpenTokSession();
        params.session_id = opentokSession.sessionId;

        // Create and save session
        const session = new SessionModel(params);
        const savedSession = await session.save();

        return {
            status: true,
            result: savedSession
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Get all sessions/agendas
 * @returns {Promise<Object>} Result with status and data/error
 */
export const getAgenda = async () => {
    try {
        const sessions = await SessionModel.find();
        
        return {
            status: true,
            result: sessions
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Delete a session/agenda and clean up related data
 * @param {string} id - Session ID to delete
 * @returns {Promise<Object>} Result with status and data/error
 */
export const deleteAgenda = async (id) => {
    try {
        if (!id) {
            throw new Error('Session ID is required for deletion');
        }

        // Delete the session
        const deletedSession = await SessionModel.deleteOne({ _id: id });
        if (deletedSession.deletedCount === 0) {
            throw new Error('Session not found or already deleted');
        }

        // Process related interpreters
        await processInterpreterCleanup(id);

        return {
            status: true,
            result: {
                message: 'Session and related data deleted successfully',
                deletedSession: deletedSession
            }
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Create OpenTok session
 * @returns {Promise<Object>} OpenTok session object
 */
const createOpenTokSession = () => {
    return new Promise((resolve, reject) => {
        opentok.createSession({ mediaMode: "routed" }, (error, session) => {
            if (error) {
                reject(error);
            } else {
                resolve(session);
            }
        });
    });
};

/**
 * Process interpreter cleanup when session is deleted
 * @param {string} sessionId - Session ID being deleted
 * @returns {Promise<void>}
 */
const processInterpreterCleanup = async (sessionId) => {
    try {
        const interpreters = await InterpreterModel.find({ 
            session: { $in: [sessionId] } 
        });

        for (const interpreter of interpreters) {
            await processInterpreterUpdate(interpreter, sessionId);
        }
    } catch (error) {
        console.error(`Error processing interpreter cleanup: ${error.message}`);
    }
};

/**
 * Process interpreter update when session is deleted
 * @param {Object} interpreter - Interpreter object
 * @param {string} sessionId - Session ID being deleted
 * @returns {Promise<void>}
 */
const processInterpreterUpdate = async (interpreter, sessionId) => {
    try {
        if (interpreter.session && interpreter.session.length > 1) {
            // Remove this session from interpreter's session list
            const updatedSessions = interpreter.session.filter(
                session => session.toString() !== sessionId.toString()
            );
            interpreter.session = updatedSessions;
            await interpreter.save();
        } else {
            // Delete interpreter and related event user if this is their only session
            await deleteInterpreterAndEventUser(interpreter);
        }
    } catch (error) {
        console.error(`Error processing interpreter update: ${error.message}`);
    }
};

/**
 * Delete interpreter and related event user
 * @param {Object} interpreter - Interpreter object to delete
 * @returns {Promise<void>}
 */
const deleteInterpreterAndEventUser = async (interpreter) => {
    try {
        // Delete related event user
        await EventUsersModel.deleteOne({
            email: interpreter.email,
            event_id: interpreter.event_id,
            role: 'interpreter'
        });

        // Delete interpreter
        await InterpreterModel.deleteOne({ _id: interpreter._id });
    } catch (error) {
        console.error(`Error deleting interpreter and event user: ${error.message}`);
    }
};

// Export default object for backward compatibility
export default {
    getEventSessions,
    updateAgenda,
    saveAgenda,
    getAgenda,
    deleteAgenda
};