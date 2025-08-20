import api from '../api';
import { Axioslib } from '../api';

const uploadCoverImg = async (id, data) => {
   
    return Axioslib.post(`event/upload-cover-image/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const uploadLogoImg = async (id, data) => {
    return Axioslib.post(`/event/upload-logo/${id}`, data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const uploadLobbyResource = async (id, data) => {
    return Axioslib.post(`event/upload-lobby-resource/${id}`, data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const uploadLoginPageBg = async (id, data) => {
    return Axioslib.post(`event/upload-login-page-bg/${id}`, data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const uploadLandingPageBg = async (id, data) => {
    return Axioslib.post(`event/upload-landing-page-bg/${id}`, data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const uploadConferencePageBg = async (id, data) => {
    return Axioslib.post(`event/upload-conference-page-bg/${id}`, data,{
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

const saveEventFileDetails = async (param) => {
    return api.post("/event/save-file-event", param);
};

const deleteEventFiles = async (param) => {
    return api.delete(`event/delete-event-file`,param);
};

const getEventFilesByEventID = async (param) => {
    return api.post(`event/file-event-list`,param);
};

const uploadEventUsers = async (body) => {
    return api.post("event/upload-event-user", body);
};


export default {
    uploadCoverImg,
    uploadLogoImg,
    uploadLobbyResource,
    uploadLoginPageBg,
    uploadLandingPageBg,
    uploadConferencePageBg,
    saveEventFileDetails,
    deleteEventFiles,
    getEventFilesByEventID,
    uploadEventUsers,
}; 