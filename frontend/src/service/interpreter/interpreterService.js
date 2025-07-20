import {Axioslib} from "@/service/api";

const getInterpretersByEventID = (body) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/get-event-by-id", body)
                .then(response => {
                    if (response) {
                        resolve(response)
                    } else {
                        reject({})
                    }
                }, error => {
                    resolve(error.response);
                });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const getEventMaterialsByEventID = (body) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/get-material-by-id", body)
                .then(response => {
                    if (response) {
                        resolve(response)
                    } else {
                        reject({})
                    }
                }, error => {
                    resolve(error.response);
                });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const updateAssignment = (body) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/update-assignment", body)
                .then(response => {
                    if (response) {
                        resolve(response)
                    } else {
                        reject({})
                    }
                }, error => {
                    resolve(error.response);
                });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const addAssignment = (body) => {    
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/add-assigment", body)
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const getAssignment = (body) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.get("/interpreter/get-assigment")
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}
const deleteAssignment = (id) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.delete("/interpreter/delete-assigment/"+id)
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const uploadFile = (data, id) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/upload-event-material/"+id,data)
            .then(response => {                
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}

const addEventMaterials = (body) => {    
    return new Promise((resolve, reject) => {
        try {
            Axioslib.post("/interpreter/add-event-material", body)
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}
const getEventMaterials = (body) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.get("/interpreter/get-material")
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}


const deleteEventMaterial = (id) => {
    return new Promise((resolve, reject) => {
        try {
            Axioslib.delete("/interpreter/delete-event-materaial/"+id)
            .then(response => {
                if (response) {
                    resolve(response)
                } else {
                    reject({})
                }
            }, error => {
                resolve(error.response);
            });
        } catch (e) {
            resolve({ "error": true, "message": "Server can't be reached" });
        }
    })
}
export const apiInterPreterService = {
    getInterpretersByEventID: getInterpretersByEventID,
    getEventMaterialsByEventID: getEventMaterialsByEventID,
    addAssignment : addAssignment,
    updateAssignment: updateAssignment,
    getAssignment : getAssignment,
    deleteAssignment : deleteAssignment,
    uploadFile : uploadFile,
    addEventMaterials : addEventMaterials,
    getEventMaterials : getEventMaterials,
    deleteEventMaterial:deleteEventMaterial
}

export default apiInterPreterService;