import PollResponseModel from "@/models/pollResponseModel.js";
import PollModel from "@/models/pollModel.js";
import PollQuestionModel from "@/models/pollQuestionModel.js";
import mongoose from "mongoose";
import jwt from "jwt-simple";
import ErrorHandler from "@/utils/ErrorHandler.js";
import "dotenv/config";

export const savePoll = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.session_id) {
            return {
                status: false,
                error: "The session id field is required"
            };
        }

        if (!params.title) {
            return {
                status: false,
                error: "The poll title field is required"
            };
        }

        const poll = new PollModel(params);
        const response = await poll.save();
        
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

export const updatePoll = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        if (!params.session_id) {
            return {
                status: false,
                error: "The session id field is required"
            };
        }

        if (!params.title) {
            return {
                status: false,
                error: "The poll title field is required"
            };
        }

        const data = await PollModel.findById(params.id);
        if (!data) {
            return {
                status: false,
                error: "Poll not found"
            };
        }

        if (params.title) data.title = params.title;
        const response = await data.save();

        return {
            status: true,
            message: "Updated successfully",
            data: response
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

export const getPollReport = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.poll_id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        const result = await PollQuestionModel.collection.aggregate([
            {
                $lookup: {
                    from: 'poll-responses',
                    localField: '_id',
                    foreignField: 'question_id',
                    as: 'responses'
                }
            },
            { $match: { "poll_id": mongoose.Types.ObjectId(params.poll_id) } },
            { $sort: { createdAt: 1 } }
        ]).toArray();

        if (result && result.length > 0) {
            for (let r = 0; r < result.length; r++) {
                let pollresponses = result[r]['responses'];
                let options = result[r]['options'];
                if (pollresponses && pollresponses.length > 0) {
                    let totalResponses = pollresponses.length;
                    let groupedOptions = pollresponses.reduce((r, a) => {
                        r[a.answer] = [...r[a.answer] || [], a];
                        return r;
                    }, {});
                    let optionsPerPercentage = [];
                    options.map((option) => {
                        for (let op in option) {
                            let percentage = 0;
                            if (groupedOptions[op]) {
                                percentage = (parseInt(groupedOptions[op].length) / parseInt(totalResponses)) * 100;
                            }
                            let report = { [op]: percentage };
                            optionsPerPercentage.push(report);
                        }
                    });
                    result[r]['report'] = optionsPerPercentage;
                    result[r]['total_response'] = totalResponses;
                }
            }
            return { 
                status: true, 
                data: result 
            };
        } else {
            return { 
                status: false, 
                data: [] 
            };
        }
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

export const getPollsList = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.session_id) {
            return {
                status: false,
                error: "The session id field is required"
            };
        }

        const response = await PollModel.find({ "session_id": { $eq: params.session_id } })
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

export const getPollsListForAllEvent = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.session_id) {
            return {
                status: false,
                error: "The session id field is required"
            };
        }

        const response = await PollModel.find({ "session_id": { $in: params.session_id } })
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

export const deletePoll = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.poll_id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        await PollModel.deleteOne({ _id: params.poll_id });

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

export const savePollQuestion = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.poll_id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        if (!params.question) {
            return {
                status: false,
                error: "The question field is required"
            };
        }

        if (!params.options || params.options.length <= 0) {
            return {
                status: false,
                error: "The options field is required"
            };
        }

        const pollQuestion = new PollQuestionModel(params);
        const response = await pollQuestion.save();

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

export const updatePollQuestion = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.id) {
            return {
                status: false,
                error: "The question id field is required"
            };
        }

        if (!params.poll_id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        if (!params.question) {
            return {
                status: false,
                error: "The question field is required"
            };
        }

        if (!params.options || params.options.length <= 0) {
            return {
                status: false,
                error: "The options field is required"
            };
        }

        const pollData = await PollModel.findById(params.poll_id);
        if (!pollData) {
            return {
                status: false,
                error: "Poll id not found"
            };
        }

        const data = await PollQuestionModel.findById(params.id);
        if (!data) {
            return {
                status: false,
                error: "Question id not found"
            };
        }

        if (params.question) data.question = params.question;
        if (params.options) data.options = params.options;
        if (params.correct_answer) data.correct_answer = params.correct_answer;
        
        const response = await data.save();

        return {
            status: true,
            message: "Updated successfully",
            data: response
        };
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

export const getPollQuestions = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.poll_id) {
            return {
                status: false,
                error: "The poll id field is required"
            };
        }

        const response = await PollQuestionModel.find({ "poll_id": { $eq: params.poll_id } })
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

export const getIndividualPollQuestionReport = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.question_id) {
            return {
                status: false,
                error: "The question id field is required"
            };
        }

        const result = await PollQuestionModel.collection.aggregate([
            {
                $lookup: {
                    from: 'poll-responses',
                    localField: '_id',
                    foreignField: 'question_id',
                    as: 'responses'
                }
            },
            { $match: { _id: mongoose.Types.ObjectId(params.question_id) } }
        ]).toArray();

        if (result && result.length > 0) {
            for (let r = 0; r < result.length; r++) {
                let pollresponses = result[r]['responses'];
                let options = result[r]['options'];
                if (pollresponses && pollresponses.length > 0) {
                    let totalResponses = pollresponses.length;
                    let groupedOptions = pollresponses.reduce((r, a) => {
                        r[a.answer] = [...r[a.answer] || [], a];
                        return r;
                    }, {});
                    let optionsPerPercentage = [];
                    options.map((option) => {
                        for (let op in option) {
                            let percentage = 0;
                            if (groupedOptions[op]) {
                                percentage = Math.round((parseInt(groupedOptions[op].length) / parseInt(totalResponses)) * 100);
                            }
                            let report = { [op]: percentage };
                            optionsPerPercentage.push(report);
                        }
                    });
                    result[r]['report'] = optionsPerPercentage;
                    result[r]['total_response'] = totalResponses;
                }
            }
            return {
                status: true,
                data: result
            };
        } else {
            return {
                status: false,
                data: []
            };
        }
    } catch (error) {
        return {
            status: false,
            error: error.message
        };
    }
};

export const deletePollQuestion = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.question_id) {
            return {
                status: false,
                error: "The question id field is required"
            };
        }

        await PollQuestionModel.deleteOne({ _id: params.question_id });

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

export const savePollUserAnswer = async (params) => {
    try {
        if (!params) {
            throw new ErrorHandler("Invalid Parameter", 401);
        }

        if (!params.question_id) {
            return {
                status: false,
                error: "The question id field is required"
            };
        }

        if (!params.answer) {
            return {
                status: false,
                error: "The answer field is required"
            };
        }

        if (!params.user_id) {
            return {
                status: false,
                error: "The user id field is required"
            };
        }

        const filterData = { question_id: params.question_id, user_id: params.user_id };
        const data = await PollResponseModel.findOne(filterData);

        if (data) {
            if (params.answer) data.answer = params.answer;
            const response = await data.save();
            return {
                status: true,
                message: "Updated successfully",
                data: response
            };
        } else {
            const pollResponse = new PollResponseModel(params);
            const response = await pollResponse.save();
            return {
                status: true,
                message: "Saved successfully",
                data: response
            };
        }
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