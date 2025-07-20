import EventLanguageModel from "@/models/eventLanguageModel.js";
import InterpreterModel from "@/models/interpreterModel.js";
import EventUserModel from "@/models/eventUserModel.js";

/**
 * Get all languages for an event
 */
export const getEventLanguages = async (params) => {
    try {
        const data = await EventLanguageModel.find({ "event_id": params.event_id })
            .sort({ createdAt: 'asc' })
            .exec();
            
        return {
            status: true,
            data: data
        };
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
};

/**
 * Save a new language
 */
export const saveLanguage = async (params) => {
    try {
        if (!params) {
            return {
                status: false,
                error: 'Invalid parameters'
            };
        }

        const language = new EventLanguageModel(params);
        const response = await language.save();
        
        return {
            status: true,
            result: response
        };
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
};

/**
 * Update a language
 */
export const updateLanguage = async (params) => {
    try {
        if (!params) {
            return {
                status: false,
                error: 'Invalid parameters'
            };
        }

        const data = await EventLanguageModel.findById(params._id).exec();
        
        if (!data) {
            return {
                status: false,
                error: 'Language not found'
            };
        }

        if (params.title) {
            data.title = params.title;
        }
        if (params.language_id) {
            data.language_id = params.language_id;
        }

        const response = await data.save();
        
        return {
            status: true,
            result: response
        };
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
};

/**
 * Get all languages
 */
export const getLanguage = async () => {
    return await EventLanguageModel.find();
};

/**
 * Delete a language and related interpreters and event users
 */
export const deleteLanguage = async (id) => {
    try {
        if (!id) {
            return {
                status: false,
                error: 'Invalid id'
            };
        }

        // Delete the language
        const deleteResult = await EventLanguageModel.deleteOne({ _id: id }).exec();
        
        // Find related interpreters
        const interpreters = await InterpreterModel.find({ $or: [{ "from": id }, { "to": id }] }).exec();
        
        if (interpreters && interpreters.length > 0) {
            // Process each interpreter
            for (const inter of interpreters) {
                try {
                    // Find and delete related event user
                    const existingUser = await EventUserModel.findOne({ 
                        'email': inter.email, 
                        'event_id': inter.event_id, 
                        'role': 'interpreter' 
                    }).exec();
                    
                    if (existingUser && existingUser.id) {
                        await EventUserModel.deleteOne({ _id: existingUser.id }).exec();
                    }
                    
                    // Delete the interpreter
                    await InterpreterModel.deleteOne({ _id: inter._id }).exec();
                } catch (error) {
                    // Log individual interpreter deletion errors but continue processing
                    console.error('Error deleting interpreter or related user:', error);
                }
            }
        }

        return {
            status: true,
            result: deleteResult
        };
    } catch (error) {
        return {
            status: false,
            error: error
        };
    }
};