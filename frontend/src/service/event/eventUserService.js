import api from '../api';

const checkEmailID = async (param) => {
    return api.post(`/event/check-email-id`,param);
};

const saveEventUserDetails = async (param) => {
    return api.post("/event/save-event-user", param);
};

const deleteEventUser = async (id) => {
    return api.delete(`/event/deleteUser/${id}`);
};

const checkEventUserDetailsExists = async (param) => {
    return api.post(`/event/check-event-user-details`,param);
};

const updateEventUserDetails = async (param) => {
    return api.post("/event/updateUser", param);
};

const getUserStreamReport = async (body) => {
    return api.post("/event/get-user-stream-report", body);
};

export default {
    checkEmailID,
    saveEventUserDetails,
    deleteEventUser,
    checkEventUserDetailsExists,
    updateEventUserDetails,
    getUserStreamReport,
}; 