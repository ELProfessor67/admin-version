import RoomModel from '@/models/roomModel.js';
import SessionModel from '@/models/sessionModel.js';
import InterpreterModel from '@/models/interpreterModel.js';
import EventUsersModel from '@/models/eventUserModel.js';

/**
 * Room Service - Handles all room-related operations
 */

/**
 * Save a new room
 * @param {Object} params - Room parameters
 * @returns {Promise<Object>} Result with status and data/error
 */
export const saveRoom = async (params) => {
    try {
        if (!params) {
            throw new Error('Room parameters are required');
        }

        const room = new RoomModel(params);
        const savedRoom = await room.save();
        
        return {
            status: true,
            result: savedRoom
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Update an existing room
 * @param {Object} params - Room parameters including _id
 * @returns {Promise<Object>} Result with status and data/error
 */
export const updateRoom = async (params) => {
    try {
        if (!params || !params._id) {
            throw new Error('Room ID is required for update');
        }

        const room = await RoomModel.findById(params._id);
        if (!room) {
            throw new Error('Room not found');
        }

        // Update only provided fields
        if (params.name !== undefined && params.name !== '') {
            room.name = params.name;
        }

        const updatedRoom = await room.save();
        
        return {
            status: true,
            result: updatedRoom
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Get all rooms
 * @returns {Promise<Object>} Result with status and data/error
 */
export const getRoom = async () => {
    try {
        const rooms = await RoomModel.find();
        
        return {
            status: true,
            result: rooms
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Get room by ID
 * @param {string} id - Room ID
 * @returns {Promise<Object>} Result with status and data/error
 */
export const getRoomById = async (id) => {
    try {
        if (!id) {
            throw new Error('Room ID is required');
        }

        const room = await RoomModel.findById(id);
        if (!room) {
            throw new Error('Room not found');
        }
        
        return {
            status: true,
            result: room
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Delete a room and clean up related data
 * @param {string} id - Room ID to delete
 * @returns {Promise<Object>} Result with status and data/error
 */
export const deleteRoom = async (id) => {
    try {
        if (!id) {
            throw new Error('Room ID is required for deletion');
        }

        // Delete the room
        const deletedRoom = await RoomModel.deleteOne({ _id: id });
        if (deletedRoom.deletedCount === 0) {
            throw new Error('Room not found or already deleted');
        }

        // Find and process related sessions
        const sessions = await SessionModel.find({ room: id });
        
        for (const session of sessions) {
            await processSessionDeletion(session);
        }

        return {
            status: true,
            result: {
                message: 'Room and related data deleted successfully',
                deletedRoom: deletedRoom
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
 * Process session deletion and cleanup related data
 * @param {Object} session - Session object to delete
 * @returns {Promise<void>}
 */
const processSessionDeletion = async (session) => {
    try {
        // Find interpreters associated with this session
        const interpreters = await InterpreterModel.find({ 
            session: { $in: [session._id] } 
        });

        for (const interpreter of interpreters) {
            await processInterpreterUpdate(interpreter, session._id);
        }

        // Delete the session
        await SessionModel.deleteOne({ _id: session._id });
    } catch (error) {
        console.error(`Error processing session deletion: ${error.message}`);
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
        if (interpreter.session.length > 1) {
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
    saveRoom,
    updateRoom,
    getRoom,
    getRoomById,
    deleteRoom
};