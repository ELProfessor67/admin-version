import languageModel from '@/models/languageModel.js';
import AssignmentModel from '@/models/interpreterModel.js';
import eventMaterialModel from '@/models/eventMaterialModel.js';
import eventUsersModel from '@/models/eventUserModel.js';

// Helper function to remove event user
const removeEventUser = async (email, eventId, removeFromOtherUsers) => {
    if (email !== null && email !== undefined) {
        try {
            const eventUsers = await eventUsersModel.findOne({ "email": email, 'event_id': eventId })
                .sort({ createdAt: 'asc' });
            
            if (eventUsers !== null && eventUsers.id !== null && eventUsers.id !== undefined) {
                await eventUsersModel.deleteOne({ _id: eventUsers.id });
            }
            
            const otherUsers = await eventUsersModel.findOne({ "email": removeFromOtherUsers, 'event_id': eventId })
                .sort({ createdAt: 'asc' });
            
            if (otherUsers !== null && otherUsers.id !== null && otherUsers.id !== undefined) {
                await eventUsersModel.deleteOne({ _id: otherUsers.id });
            }
        } catch (error) {
            console.error('Error removing event user:', error);
        }
    }
};

// Interpreter/Assignment functions
export const getEventInterpreters = async (params) => {
    try {
        const data = await AssignmentModel.find({ "event_id": { $eq: params.event_id } })
            .sort({ createdAt: 'asc' });
        
        return {
            status: true,
            data: data
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const getLanguages = async () => {
    try {
        const response = await languageModel.find();
        return {
            status: true,
            result: response
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const updateAssignment = async (params) => {
    try {
        if (!params) {
            return {
                status: false,
                error: 'Invalid parameters'
            };
        }

        const data = await AssignmentModel.findById(params._id);
        
        if (!data) {
            return {
                status: false,
                error: 'Assignment not found'
            };
        }

        // Update fields if provided
        if (params.name !== "" && params.name !== undefined) {
            data.name = params.name;
        }
        if (params.email !== "" && params.email !== undefined) {
            if (data.email !== params.email) {
                await removeEventUser(data.email, data.event_id, params.email);
            }
            data.email = params.email;
        }
        if (params.from !== "" && params.from !== undefined) {
            data.from = params.from;
        }
        if (params.to !== "" && params.to !== undefined) {
            data.to = params.to;
        }
        if (params.session !== "" && params.session !== undefined) {
            data.session = params.session;
        }
        if (params.two_way !== "" && params.two_way !== undefined) {
            data.two_way = params.two_way;
        }
        if (params.show_video !== "" && params.show_video !== undefined) {
            data.show_video = params.show_video;
        }

        const response = await data.save();
        return {
            status: true,
            result: response
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const saveAssignment = async (params) => {
    try {
        if (!params) {
            return {
                status: false,
                error: 'Invalid parameters'
            };
        }

        const assignment = new AssignmentModel(params);
        const response = await assignment.save();
        
        return {
            status: true,
            result: response
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const getAssignment = async () => {
    try {
        const assignments = await AssignmentModel.find();
        return assignments;
    } catch (err) {
        throw err;
    }
};

export const deleteAssignment = async (id) => {
    try {
        if (!id) {
            return {
                status: false,
                error: 'Invalid ID'
            };
        }

        const interpreter = await AssignmentModel.findById(id);
        
        if (!interpreter) {
            return {
                status: false,
                error: 'Interpreter not found'
            };
        }

        // Remove associated event user
        const existingUser = await eventUsersModel.findOne({ 
            'email': interpreter.email, 
            'event_id': interpreter.event_id, 
            'role': 'interpreter' 
        });

        if (existingUser && existingUser.id) {
            await eventUsersModel.deleteOne({ _id: existingUser.id });
        }

        const data = await AssignmentModel.deleteOne({ _id: id });
        
        return {
            status: true,
            result: data
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

// Event Materials functions
export const getEventMaterialsByEventID = async (params) => {
    try {
        const data = await eventMaterialModel.find({ "event_id": { $eq: params.event_id } })
            .sort({ createdAt: 'asc' });
        
        return {
            status: true,
            data: data
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const saveEventMaterials = async (params) => {
    try {
        if (!params) {
            return {
                status: false,
                error: 'Invalid parameters'
            };
        }

        const eventMaterial = new eventMaterialModel(params);
        const response = await eventMaterial.save();
        
        return {
            status: true,
            result: response
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};

export const getEventMaterials = async () => {
    try {
        const eventMaterial = await eventMaterialModel.find();
        return eventMaterial;
    } catch (err) {
        throw err;
    }
};

export const deleteEventMaterial = async (id) => {
    try {
        if (!id) {
            return {
                status: false,
                error: 'Invalid ID'
            };
        }

        const data = await eventMaterialModel.deleteOne({ _id: id });
        
        return {
            status: true,
            result: data
        };
    } catch (err) {
        return {
            status: false,
            error: err
        };
    }
};