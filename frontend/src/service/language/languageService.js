import api from '@/service/api';

const getLanguages = async () => {
    return api.get("/interpreter/get-language");
};

const getLanguagesByEventID = async (body) => {
    return api.post("/language/get-by-event-id", body);
};

const addLanguage = async (body) => {
    return api.post("/language/add", body);
};

const updateLanguage = async (body) => {
    return api.post("/language/update", body);
};

const deleteLanguage = async (id) => {
    return api.delete(`/language/delete/${id}`);
};

export default {
    getLanguages,
    getLanguagesByEventID,
    addLanguage,
    updateLanguage,
    deleteLanguage,
}; 