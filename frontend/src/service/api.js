import { REACT_APP_API_URL } from '@/constants/URLConstant';
import axios from 'axios';
export const Axioslib = axios.create({
    baseURL: `${REACT_APP_API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json'
        // 'Authorization': 'Bearer 2RjTXIe4QifUppQtBDBY-F0T9p9vp2fhNKK0'
    }
});

const handleResponse = (response) => {
    if (response) {
        return response;
    }
    return Promise.reject(response);
};

const handleError = (error) => {
    if (error.response) {
        return Promise.resolve(error.response);
    }
    return Promise.resolve({ "error": true, "message": "Server can't be reached" });
};

const get = (url) => {
    return Axioslib.get(url)
        .then(handleResponse)
        .catch(handleError);
};

const post = (url, data) => {
    return Axioslib.post(url, data)
        .then(handleResponse)
        .catch(handleError);
};

const put = (url, data) => {
    return Axioslib.put(url, data)
        .then(handleResponse)
        .catch(handleError);
};

const deleteRequest = (url) => {
    return Axioslib.delete(url)
        .then(handleResponse)
        .catch(handleError);
};


const api = {
    get,
    post,
    put,
    delete: deleteRequest,
};

export default api; 