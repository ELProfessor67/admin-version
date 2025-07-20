import api from '@/service/api';

const getPollsForEvent = async (body) => {
    return api.post("polls/listPollsForEvent", body);
};

const getPollReport = async (body) => {
    return api.post("polls/getreport", body);
};

export const pollService = {
    getPollsForEvent,
    getPollReport,
}; 