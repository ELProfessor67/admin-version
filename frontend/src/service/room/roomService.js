import api from '@/service/api';

const getRoomsByEventID = async (body) => {
    return api.post("/event/get-room-events", body);
};

const addRoom = async (body) => {
    return api.post("/room/add", body);
};

const updateRoom = async (body) => {
    return api.post("/room/update", body);
};

const deleteRoom = async (id) => {
    return api.delete(`/room/delete/${id}`);
};

export default {
    getRoomsByEventID,
    addRoom,
    updateRoom,
    deleteRoom,
}; 