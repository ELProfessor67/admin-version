import api from '@/service/api';

const getSessionsByEventID = async (body) => {
    return api.post("/session/get-by-event-id", body);
};

const updateAgenda = async (body) => {
    return api.post("/session/update-agenda", body);
};

const addAgenda = async (body) => {
    return api.post("/session/add-agenda", body);
};

const getAgenda = async () => {
    return api.get("/session/get-agenda");
};

const deleteAgenda = async (id) => {
    return api.delete(`/session/delete-agenda/${id}`);
};

export default {
    getSessionsByEventID,
    updateAgenda,
    addAgenda,
    getAgenda,
    deleteAgenda,
}; 