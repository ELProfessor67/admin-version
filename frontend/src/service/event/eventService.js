import api from '../api';

const addEvent = async (body) => {
    return api.post("/event/save-event", body);

};

const updateEventDetails = async (body) => {
    return api.post("/event/update-event", body);
};

const getEvents = async (body) => {
    return api.post("event/get-all-events", body);
};

const getEventByID = async (id) => {
    return api.post(`/event/get-event-by-id/${id}`);
};

const deleteEvent = async (id) => {
    return api.delete(`/event/delete-event/${id}`);
};

const checkEventCode = async (code) => {
    return api.get(`/event/check-event-code/${code}`);
};

export default {
    addEvent,
    updateEventDetails,
    getEvents,
    getEventByID,
    deleteEvent,
    checkEventCode,
}; 