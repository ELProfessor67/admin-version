import ChatModel from "@/models/chatModel.js";
import ErrorHandler from "@/utils/ErrorHandler.js";

/**
 * Save a chat message
 */
export const saveChat = async (params) => {
    try {
        // Validate required fields
        const requiredFields = [
            'session_id', 'sender_name', 'sender_userid', 'sender_role', 'message', 'sendto_group', 'utc_time'
        ];
        let errorMessage = {};
        let allValid = true;
        for (const field of requiredFields) {
            if (!params[field]) {
                errorMessage[field] = `The ${field.replace('_', ' ')} field is required`;
                allValid = false;
            }
        }
        
        if (!allValid) {
            return {
                status: false,
                inputs_received: params,
                message: errorMessage
            };
        }

        const chat = new ChatModel(params);
        const response = await chat.save();
        
        return {
            status: true,
            message: "Saved successfully",
            data: response
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Get chats for a session
 */
export const getChats = async (params) => {
    try {
        if (!params.session_id) {
            return {
                status: false,
                inputs_received: params,
                message: 'The session id field is required'
            };
        }

        const response = await ChatModel.find({ "session_id": params.session_id })
            .sort({ updatedAt: 'asc' });
        
        return {
            status: true,
            data: response
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Delete a single chat message by chat_id
 */
export const deleteChat = async (params) => {
    try {
        if (!params.chat_id) {
            return {
                status: false,
                inputs_received: params,
                message: 'The chat id field is required'
            };
        }

        await ChatModel.deleteOne({ _id: params.chat_id });
        
        return {
            status: true,
            message: "Deleted successfully"
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Delete all chat history for a session
 */
export const deleteChatHistory = async (params) => {
    try {
        if (!params.session_id) {
            return {
                status: false,
                inputs_received: params,
                message: 'The session id field is required'
            };
        }

        await ChatModel.deleteMany({ session_id: params.session_id });
        
        return {
            status: true,
            message: "Chat history deleted successfully"
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};