import UserModel from "@/models/userModel.js";
import EventModel from "@/models/eventModel.js";
import bcrypt from "bcryptjs";
import ErrorHandler from "@/utils/ErrorHandler";
import jwt from "jwt-simple";
import "dotenv/config";

/**
 * Check if an email exists in the user collection
 */
export const checkEmail = async (params) => {
    try {
        if(!params){
            throw new ErrorHandler("Invalid Peramter",401)
        }

        const userRef = await UserModel.findOne(params);
        if(!userRef){
            return {
                status: true,
                alreadyExists: 0
            }
        }

        return {
            status: true,
            alreadyExists: 1
        }
    } catch (error) {
        return {
            status: false,
            error: error.message
        }
    }
};

/**
 * Check if a user and event combination exists
 */
export const checkWithUserAndEvent = async (params) => {
    try {
        if (!params || !params.meeting_name || !params.user_name) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        const eventRef = await EventModel.findOne({ name: params.meeting_name });
        if (!eventRef) {
            return {
                status: true,
                alreadyExists: 0
            };
        }

        return {
            status: true,
            alreadyExists: 1
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

/**
 * Check if the provided password matches the user's password
 */
export const checkPassword = async (params) => {
    try {
        if (!params || !params.email || !params.password) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        const data = await UserModel.findOne({ email: params.email });
        if (!data) {
            return {
                status: false,
                message: 'Invalid User mail ID'
            };
        }

        let userDetails = {
            name: data.name,
            email: data.email,
            id: data._id
        };


        
        
        const isMatch = await bcrypt.compare(params.password, data.password);
        if (!isMatch) {
            return {
                status: false,
                alreadyExists: 1
            };
        }
        const token = jwt.encode(userDetails, process.env.JWT_SECRET, 'HS512');

        return {
            status: true,
            data: userDetails,
            token: token
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};


export const decodeToken = (token) => {
    try {
        if (!token) {
            throw new Error("Token is required");
        }
        const decoded = jwt.decode(token, process.env.JWT_SECRET, 'HS512');
        return decoded;
    } catch (error) {
        return null;
    }
};


export const encodeToken = (data) => {
    try {
        if (!data) {
            throw new Error("Data is required");
        }
        const token = jwt.encode(data, process.env.JWT_SECRET, 'HS512');
        return token;
    } catch (error) {
        return null;
    }
};
