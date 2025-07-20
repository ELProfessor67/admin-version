import EventUsersModel from "@/models/eventUserModel";

export const  removeEventUsers = async (params) => {
    try {
        // Step 1: Validate input parameters
        if (params.type !== undefined && params.type !== undefined) {
            // Step 2: Build user filter based on type
            let userFilter = {
                "event_id": { $eq: params._id },
                "back_end_user": true
            };
            if (params.type === 'speaker') {
                userFilter.speaker_status = true;
            } else {
                userFilter.listener_status = true;
            }

            // Step 3: Fetch event users and prepare for removal
            let userList = params.user_list;
            let eventUser = await EventUsersModel.find(userFilter).exec();
            let removeError = [];

            if (eventUser.length > 0) {
                let removeUserList = [];
                // Step 4: Identify users to remove
                for (let index = 0; index < eventUser.length; index++) {
                    let email = eventUser[index].email;
                    email = email.toLowerCase();
                    let removeUsers = [];
                    if (userList.length > 0) {
                        removeUsers = userList.filter(function (item) {
                            return item.toLowerCase() === email;
                        });
                    }
                    if (removeUsers.length === 0) {
                        removeUserList.push(eventUser[index]);
                    }
                    // Step 5: If last user, process removals
                    if (eventUser.length === index + 1) {
                        if (removeUserList.length > 0) {
                            for (let rUi = 0; rUi < removeUserList.length; rUi++) {
                                let removeEmail = removeUserList[rUi];
                                if (removeEmail !== undefined && removeEmail !== null && removeEmail !== "") {
                                    if (removeEmail._id !== undefined && removeEmail._id !== null) {
                                        EventUsersModel.findOne({ '_id': removeEmail._id }, (err, data) => {
                                            if (!err && data !== null) {
                                                data.speaker_status = false;
                                                data.listener_status = false;
                                                data.save(function (err, response) {
                                                    if (!err && response !== null) {
                                                        if (eventUser.length === index + 1 && removeUserList.length === rUi + 1) {
                                                            return ({
                                                                status: true,
                                                                error: false,
                                                                removeError: removeError
                                                            });
                                                        }
                                                    } else {
                                                        removeError.push(email);
                                                        if (eventUser.length === index + 1 && removeUserList.length === rUi + 1) {
                                                            return ({
                                                                status: true,
                                                                error: false,
                                                                removeError: removeError
                                                            });
                                                        }
                                                    }
                                                });
                                            } else {
                                                removeError.push(email);
                                                if (eventUser.length === index + 1 && removeUserList.length === rUi + 1) {
                                                    return ({
                                                        status: true,
                                                        error: false,
                                                        removeError: removeError
                                                    });
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    removeError.push(email);
                                    if (eventUser.length === index + 1 && removeUserList.length === rUi + 1) {
                                        return ({
                                            status: true,
                                            error: false,
                                            removeError: removeError
                                        });
                                    }
                                }
                            }
                        } else {
                            if (eventUser.length === index + 1) {
                                return ({
                                    status: true,
                                    error: false
                                });
                            }
                        }
                    }
                }
            } else {
                // Step 6: No users found for removal
                return ({
                    status: false,
                    error: false
                });
            }
        } else {
            // Step 7: Invalid parameters
            return ({
                status: false,
                error: true
            });
        }
    } catch (error) {
        // Step 8: Catch and return errors
        return ({
            status: false,
            error: error
        });
    }
}
