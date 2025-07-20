import api from '@/service/api';

const checkEmailAlreadyExists = async (email) => {
    return api.post("/user/check-emial-exist", email);
};

const loginwithPassword = async (email) => {
    return api.post("/user/login-with-password", email);
};
export const decodeToken = async (token) => {
    return api.get(`/user/decode-token?token=${token}`);
};
export const encodeToken = async (data) => {
    return api.post(`/user/encode-token`,data);
};

const loginWithMeetingDetails = async (email) => {
    return api.post('/user/loginWithMeetingDetails', email);
};

export const authService = {
    checkEmailAlreadyExists,
    loginwithPassword,
    loginWithMeetingDetails,
    decodeToken
}; 