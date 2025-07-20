import api from '@/service/api';

const getSessionsForEvent = async (body) => {
    return api.post("/event/get-session-details", body);
};

const getEventAgenda = async (body) => {
    return api.post("/event/get-event-agenda", body);
};

const getEventRooms = async (body) => {
    return api.post("/event/get-room-events", body);
};

const getRoomDetails = async (param) => {
    return api.post(`/event/get-room-details/`,param);
};

export default {
    getSessionsForEvent,
    getEventAgenda,
    getEventRooms,
    getRoomDetails,
}; 