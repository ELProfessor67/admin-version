import SpeakerUser from '@/models/speakerModel.js';
import path from "path";
import fs from "fs";
import { exec } from 'child_process';
import { s3AWSBucket } from '@/services/AWSService.js';
import ErrorHandler from '@/utils/ErrorHandler.js';
const __dirname = path.resolve();
import "dotenv/config";
/**
 * Save or update speaker details with optional file upload
 */
export const saveSpeakerDetails = async (params) => {
    try {
        if (!params || Object.keys(params).length === 0) {
            throw new ErrorHandler("Invalid Parameters", 400);
        }

        if (!params.user_id) {
            throw new ErrorHandler("Invalid Parameters", 400);
        }

        const userData = params.body;
        const userFile = params.file;
        let originalFileName = "";
        let extension = "";
        let fileName = "";
        let original_path = "";
        let fileContent = "";
        let s3params = "";

        if (userFile !== null && userFile !== undefined && userFile !== "") {
            originalFileName = userFile.originalname;
            extension = originalFileName.substr(originalFileName.lastIndexOf('.') + 1);
            if (extension !== undefined && extension !== null && extension !== "") {
                extension = extension.toLowerCase();
            }
            fileName = userFile.filename;
            original_path = userFile.path;
            fileContent = fs.readFileSync(path.resolve(__dirname + '/' + original_path));
            s3params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: original_path,
                Body: fileContent
            };
        }

        if (userData !== null && userData !== undefined) {
            userData.name = userData.name !== undefined ? userData.name.trim() : "";
            userData.role = userData.role !== undefined ? userData.role.trim() : "";
        }

        // Update existing speaker
        if (userData.speaker_id !== undefined && userData.speaker_id !== "") {
            let filePath = "";
            if (userData.name == '' && userData.role == "" && userFile === undefined) {
                return {
                    status: 'failed',
                    body: userData,
                    error: 'Invalid Parameters'
                };
            }

            if (userFile !== null && userFile !== undefined && userFile !== "") {
                if (extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
                    try {
                        const uploadResult = await new Promise((resolve, reject) => {
                            s3AWSBucket.putObject(s3params, function(err, data) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(data);
                                }
                            });
                        });

                        filePath = "https://conference.rafikyconnect.net/" + original_path;
                        
                        const speakerData = await new Promise((resolve, reject) => {
                            SpeakerUser.findById(userData.speaker_id, (err, speakerData) => {
                                if (err || speakerData == null) {
                                    reject(new Error('user is not found'));
                                } else {
                                    resolve(speakerData);
                                }
                            });
                        });

                        if (userData.name !== "" && userData.name !== undefined) {
                            speakerData.name = userData.name;
                        }
                        if (userData.role !== "" && userData.role !== undefined) {
                            speakerData.role = userData.role;
                        }
                        if (filePath !== "") {
                            speakerData.logo = filePath;
                        }

                        const response = await new Promise((resolve, reject) => {
                            speakerData.save(function(err, response) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(response);
                                }
                            });
                        });

                        return {
                            status: "success",
                            message: "Successfully updated",
                            data: response
                        };

                    } catch (error) {
                        return {
                            status: 'failed',
                            error: 'Error',
                            message: 'Upload failed. Please try again later'
                        };
                    }
                } else {
                    return {
                        status: 'failed',
                        error: 'Error',
                        message: 'Not supported file format.'
                    };
                }
            } else {
                const speakerData = await new Promise((resolve, reject) => {
                    SpeakerUser.findById(userData.speaker_id, (err, speakerData) => {
                        if (err || speakerData == null) {
                            reject(new Error('user is not found'));
                        } else {
                            resolve(speakerData);
                        }
                    });
                });

                if (userData.name !== "" && userData.name !== undefined) {
                    speakerData.name = userData.name;
                }
                if (userData.role !== "" && userData.role !== undefined) {
                    speakerData.role = userData.role;
                }
                if (filePath !== "") {
                    speakerData.logo = filePath;
                }

                const response = await new Promise((resolve, reject) => {
                    speakerData.save(function(err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    });
                });

                return {
                    status: "success",
                    message: "Successfully updated",
                    data: response
                };
            }
        } 
        // Create new speaker
        else if (userData.name !== null && userData.name !== "" && userData.name !== undefined && 
                 userData.role !== null && userData.role !== "" && userData.role !== undefined) {

            if (userFile !== null && userFile !== undefined && s3params !== "") {
                if (extension === 'jpeg' || extension === 'jpg' || extension === 'png') {
                    const uploadResult = await new Promise((resolve, reject) => {
                        s3AWSBucket.putObject(s3params, function(err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    });

                    const filePath = "https://conference.rafikyconnect.net/" + original_path;
                    const speakerDetails = {
                        'name': userData.name,
                        'role': userData.role,
                        'logo': filePath,
                        'user_id': params.user_id
                    };

                    const SpeakerUsers = new SpeakerUser(speakerDetails);
                    const response = await SpeakerUsers.save();

                    return {
                        status: "success",
                        message: "Added successfully",
                        data: response
                    };
                } else {
                    return {
                        status: 'failed',
                        error: 'Error',
                        message: 'Not supported file format.'
                    };
                }
            } else {
                const speakerDetails = {
                    'name': userData.name,
                    'role': userData.role,
                    'user_id': params.user_id
                };

                const SpeakerUsers = new SpeakerUser(speakerDetails);
                const response = await SpeakerUsers.save();

                return {
                    status: "success",
                    message: "Added successfully",
                    data: response
                };
            }
        } else {
            return {
                status: 'failed',
                body: userData,
                error: 'Invalid Parameters'
            };
        }
    } catch (error) {
        return {
            status: 'failed',
            error: error.message || 'Upload failed. Please try again later'
        };
    }
};

/**
 * Get speaker credentials for a specific user
 */
export const getSpeakerCredentials = async (params) => {
    try {
        if (!params || Object.keys(params).length === 0) {
            throw new ErrorHandler("Invalid Parameters", 400);
        }

        if (!params.user_id || params.user_id === "") {
            throw new ErrorHandler("user_id is mandatory", 400);
        }

        const speakerParams = {
            'user_id': { $eq: params.user_id },
            'status': { $eq: true }
        };

        const data = await SpeakerUser.find(speakerParams);

        const speakerInfo = [];
        
        if (data && data.length > 0) {
            data.forEach(element => {
                const userData = {
                    name: element.name !== null && element.name !== undefined ? element.name : "",
                    role: element.role !== null && element.role !== undefined ? element.role : "",
                    logo: element.logo !== null && element.logo !== undefined ? element.logo : "",
                    id: element.id !== null && element.id !== undefined ? element.id : "",
                    user_id: element.user_id !== undefined && element.user_id !== null ? element.user_id : "",
                    speaker_status: element.speaker_status !== null && element.speaker_status !== undefined ? element.speaker_status : ""
                };
                speakerInfo.push(userData);
            });
        }

        return {
            status: "success",
            user_id: params.user_id,
            result: speakerInfo,
            message: "Successfully get User details"
        };

    } catch (error) {
        return {
            status: 'failed',
            error: error.message || 'User not Existing'
        };
    }
};

/**
 * Delete speaker credentials by setting status to false
 */
export const deleteSpeakerCredentials = async (params) => {
    try {
        if (!params.speaker_id || params.speaker_id === null || params.speaker_id === "" || params.speaker_id.trim() === "") {
            throw new ErrorHandler("Speaker id field is required", 400);
        }

        const userData = await SpeakerUser.findById(params.speaker_id);

        userData.status = false;
        
        await userData.save();

        return {
            status: "success",
            message: "Successfully deleted"
        };

    } catch (error) {
        return {
            status: "error",
            message: error.message || "An error occurred"
        };
    }
};