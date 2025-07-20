import React, { useState, useEffect, useCallback, useRef } from "react";
import apiInterPreterService from "@/service/interpreter/interpreterService";
import Swal from 'sweetalert2';
import { Toast } from "@/components/toastComponent";
import editPencilIcon from "@/assets/img/edit-pencil.svg";
import trashIcon from "@/assets/img/trash.svg";
import uploadIcon from "@/assets/img/upload.svg";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Modal } from 'reactstrap';
import Select from "react-select";
import ClipLoader from "react-spinners/ClipLoader";
import helper from "@/utils/helper";

const AI_INTERPETER_EMAIL_DOMAIN = "ai.com";

const isAIInterpreter = (email = '') => email.includes(AI_INTERPETER_EMAIL_DOMAIN);

export default function Interpreters(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [assignmentDetails, setAssignmentDetails] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [eventMaterials, setEventMaterials] = useState([]);
    const [eventID, setEventID] = useState('');
    const [disableBtn, setDisableBtn] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
    const [disableSaveMaterialBtn, setDisableSaveMaterialBtn] = useState(false);
    const [interpreterId, setInterpreterId] = useState("");
    const [sessionErrorMsg, setSessionErrorMsg] = useState("");
    const [updateUsers, setUpdateUsers] = useState(false);
    const [fileFormatErrorMsg, setFileFormatErrorMsg] = useState('');
    
    const sessionRef = useRef([]);
    const eventIDRef = useRef("");
    const splittedURLRef = useRef([]);
    const initialValuesRef = useRef({
        interpreterName: "",
        emailId: "",
        fromLanguage: "",
        toLanguage: "",
        session: "",
        twoWayAllowed: false,
        interpreterVideo: false,
        translationAi: false,
    });


    console.log("assignmentDetails", assignmentDetails);

    const validationSchema = Yup.object().shape({
        interpreterName: Yup.string().trim()
            .when("translationAi", {
                is: false,
                then: (schema) => schema.required("Name is required"),
                otherwise: (schema) => schema.notRequired(),
            }).required('Name is required!'),
        emailId: Yup.string()
            .trim()
            .email("Email is invalid")
            .when("translationAi", {
                is: false,
                then: (schema) => schema.required("Email is required"),
                otherwise: (schema) => schema.notRequired(),
            }),
    });

    const getInterpretersByEventID = useCallback(() => {
        let params = {
            event_id: eventIDRef.current
        }
        apiInterPreterService.getInterpretersByEventID(params).then((data) => {
            console.log("hellllllllllllllllllllllllllllll 1");
            if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                console.log("hellllllllllllllllllllllllllllll 2");
                if (data.data.data !== "" && data.data.data !== undefined) {
                    console.log("hellllllllllllllllllllllllllllll 3");
                    setAssignmentDetails(data.data.data);
                    console.log("assignmentDetails", assignmentDetails,data.data.data);
                }
            }
        });
    }, []);

    const getEventMaterialsByEventID = useCallback(() => {
        let params = {
            event_id: eventIDRef.current
        }
        apiInterPreterService.getEventMaterialsByEventID(params).then((data) => {
            if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                if (data.data.data !== "" && data.data.data !== undefined) {
                    console.log("EEE", data.data.data)
                    setEventMaterials(data.data.data);
                }
            }
        });
    }, []);

    const updateInterpreterDetails = useCallback((type) => {
        if (assignmentDetails.length > 0) {
            if (type === 'session') {
                let newInterpreter = [];
                let interpreterDetails = assignmentDetails;
                interpreterDetails.map((interpreter) => {
                    if (interpreter.session.length > 1) {
                        let newIntSession = [];
                        interpreter.session.map((sess) => {
                            if (sessionRef.current.filter(session => (session.value === sess)) !== undefined
                                && sessionRef.current.filter(session => (session.value === sess))[0] !== undefined
                                && sessionRef.current.filter(session => (session.value === sess))[0].label !== undefined) {
                                let sessionName = sessionRef.current.filter(session => (session.value === sess))[0].label;
                                if (sessionName !== undefined && sessionName !== "") {
                                    newIntSession.push(sess);
                                }
                            }
                            return true;
                        })
                        if (newIntSession.length > 0) {
                            interpreter['session'] = newIntSession;
                            newInterpreter.push(interpreter);
                        }
                    } else {
                        if (sessionRef.current.filter(session => (session.value === interpreter.session[0])) !== undefined
                            && sessionRef.current.filter(session => (session.value === interpreter.session[0]))[0] !== undefined
                            && sessionRef.current.filter(session => (session.value === interpreter.session[0]))[0].label !== undefined) {
                            let sessionName = sessionRef.current.filter(session => (session.value === interpreter.session[0]))[0].label;
                            if (sessionName !== undefined && sessionName !== "") {
                                newInterpreter.push(interpreter);
                            }
                        }
                    }
                    return true;
                });
                let newArray = JSON.stringify(newInterpreter);
                let oldArray = JSON.stringify(assignmentDetails);
                if (newArray !== oldArray) {
                    setAssignmentDetails(newInterpreter);
                }

            } else {
                let interpreterDetails = assignmentDetails;
                let newInterpreter = []
                interpreterDetails.map((interpreter) => {
                    let fromExists = true;
                    let toExists = true;
                    if (interpreter.from !== "" && interpreter.from !== undefined
                        && interpreter.to !== "" && interpreter.to !== undefined) {
                        if (languages.filter(lang => (lang.value === interpreter.from)) !== undefined
                            && languages.filter(lang => (lang.value === interpreter.from))[0] !== undefined
                            && languages.filter(lang => (lang.value === interpreter.from))[0].label !== undefined) {
                            let fromLang = languages.filter(lang => (lang.value === interpreter.from))[0].label;
                            if (fromLang !== undefined && fromLang !== "") {
                                fromExists = false;
                            }
                        }
                        if (languages.filter(lang => (lang.value === interpreter.to)) !== undefined
                            && languages.filter(lang => (lang.value === interpreter.to))[0] !== undefined
                            && languages.filter(lang => (lang.value === interpreter.to))[0].label !== undefined) {
                            let toLang = languages.filter(lang => (lang.value === interpreter.to))[0].label;
                            if (toLang !== undefined && toLang !== "") {
                                toExists = false;
                            }
                        }
                    } else {
                        fromExists = false;
                        toExists = false;
                    }
                    if (fromExists === false && toExists === false) {
                        newInterpreter.push(interpreter);
                    }
                    return true;
                });

                let newArray = JSON.stringify(newInterpreter);
                let oldArray = JSON.stringify(assignmentDetails);
                    // if (newArray !== oldArray) {
                    //     setAssignmentDetails(newInterpreter);
                    // }
            }
        }
    }, [assignmentDetails, languages]);

    const openAssignmentModal = useCallback(() => {
        if (sessionRef.current.length > 0) {
            setIsModalOpen(true);
            setDisableBtn(false);
        } else {
            Toast.fire({
                icon: 'warning',
                title: "No session available. Please refresh page"
            });
        }
    }, []);

    const closeAssignmentModal = useCallback(() => {
        setIsModalOpen(false);
        setDisableBtn(false);
        setInterpreterId("");
        
        initialValuesRef.current.interpreterName = "";
        initialValuesRef.current.emailId = "";
        initialValuesRef.current.fromLanguage = "";
        initialValuesRef.current.toLanguage = "";
        initialValuesRef.current.session = "";
        initialValuesRef.current.twoWayAllowed = false;
        initialValuesRef.current.translationAi = false;
    }, []);

    const submitAssignment = useCallback(async (values) => {
        let sessionData = [];
        if (values.session !== "" && values.session !== null) {
            values.session.map((data) => {
                return sessionData.push(data.value);
            })
        }

        if (sessionData.length <= 0) {
            setSessionErrorMsg('Session is required');
            return false;
        }
        setErrorMsg('');
        setSessionErrorMsg('');
        const aiEmail = `${Date.now().toString()}@${AI_INTERPETER_EMAIL_DOMAIN}`
        let assignmentDetails = {
            'name': values.translationAi ? "AI Interpreter" : values.interpreterName.trim(),
            'email': values.translationAi ? aiEmail : values.emailId.trim(),
            'from': values.fromLanguage.value,
            'to': values.toLanguage.value,
            'session': sessionData,
            'two_way': values.translationAi ? false : values.twoWayAllowed,
            'show_video': values.translationAi ? false : values.interpreterVideo,
            'event_id': eventID
        }
        if (languages.length > 0 && values.fromLanguage.value === undefined) {
            setErrorMsg('Please select from lanuage');
        } else if (languages.length > 0 && values.toLanguage.value === undefined) {
            setErrorMsg('Please select To lanuage');
        } else if (languages.length > 0 && assignmentDetails.to === assignmentDetails.from) {
            setErrorMsg('Please select different lanuage');
        } else if (interpreterId !== undefined && interpreterId !== null && interpreterId !== "") {
            assignmentDetails._id = interpreterId;

            apiInterPreterService.updateAssignment(assignmentDetails).then((data) => {
                setDisableBtn(false);
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "Interpreter updated successfully"
                        })
                        setUpdateUsers(true);
                        setAssignmentDetails(prevAssignmentDetails => {
                            const index = prevAssignmentDetails.findIndex(interpreters => interpreters._id === interpreterId);
                            const interpreters = [...prevAssignmentDetails];
                            interpreters[index] = data.data.result;
                            return interpreters;
                        });
                        closeAssignmentModal();

                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Unauthorized Access"
                        })
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Please revalidate the form and submit"
                        })
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    })
                }
            });

        } else if (eventID !== "") {
            setDisableBtn(true);
            apiInterPreterService.addAssignment(assignmentDetails).then((data) => {
                setDisableBtn(false);
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "Interpreter Added Successfully"
                        })
                        setAssignmentDetails(prevAssignmentDetails => [...prevAssignmentDetails, data.data.result]);
                        setUpdateUsers(true);
                        closeAssignmentModal();
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Unauthorized Access"
                        })
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Please revalidate the form and submit"
                        })
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    })
                }
            });
        } else {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please refresh page!"
            });
            closeAssignmentModal();
        }
    }, [eventID, interpreterId, languages, closeAssignmentModal]);

    const deleteMaterial = useCallback((id, index) => {
        Swal.fire({
            title: 'Delete Event Material',
            text: "Are you sure you want to delete?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: "Yes, Proceed",
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#00d2a5',
            customClass: {
                confirmButton: 'green-bg-white-f-btn'
            },
            focusConfirm: false,
            focusCancel: true
        }).then((result) => {
            if (result.value) {
                try {
                    apiInterPreterService.deleteEventMaterial(id).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Event Material deleted successfully"
                                })
                                setEventMaterials(prevEventMaterials => {
                                    const newEventMaterials = [...prevEventMaterials];
                                    newEventMaterials.splice(index, 1);
                                    return newEventMaterials;
                                });

                            } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Unauthorized Access"
                                })
                            } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Please revalidate the form and submit"
                                })
                            } else {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Something went wrong. Please try again!"
                                })
                            }
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "No response from the server. Please try again!"
                            })
                        }
                    });
                } catch {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    })
                }
            }
        })
    }, []);

    const editInterpreter = useCallback((val) => {
        let Fromlanguage = ""
        if (languages.filter(lng => (lng.value === val.from)) !== undefined && languages.filter(lng => (lng.value === val.from))[0] !== undefined && languages.filter(lng => (lng.value === val.from))[0].label !== undefined) {
            Fromlanguage = languages.filter(lng => (lng.value === val.from))[0]
        }

        let Tolanguage = ""
        if (languages.filter(lng => (lng.value === val.to)) !== undefined && languages.filter(lng => (lng.value === val.to))[0] !== undefined && languages.filter(lng => (lng.value === val.to))[0].label !== undefined) {
            Tolanguage = languages.filter(lng => (lng.value === val.to))[0]
        }

        let selectedSessionValue = val.session;
        let selectedSessionData = [];

        for (let sv = 0; sv < selectedSessionValue.length; sv++) {
            if (sessionRef.current.filter(session => (session.value === selectedSessionValue[sv])) !== undefined && sessionRef.current.filter(session => (session.value === selectedSessionValue[sv]))[0] !== undefined && sessionRef.current.filter(session => (session.value === selectedSessionValue[sv]))[0].label !== undefined) {
                selectedSessionData.push(sessionRef.current.filter(session => (session.value === selectedSessionValue[sv]))[0])
            }
        }

        initialValuesRef.current.interpreterName = val.name;
        initialValuesRef.current.emailId = val.email;
        initialValuesRef.current.fromLanguage = Fromlanguage;
        initialValuesRef.current.toLanguage = Tolanguage;
        initialValuesRef.current.session = selectedSessionData;
        initialValuesRef.current.twoWayAllowed = val.two_way;
        initialValuesRef.current.translationAi = isAIInterpreter(val.email);
        initialValuesRef.current.interpreterVideo = val.show_video;

        setInterpreterId(val._id);
        openAssignmentModal();
    }, [languages, openAssignmentModal]);

    const deleteAssignment = useCallback((id, index) => {
        Swal.fire({
            title: 'Delete Interpreter',
            text: "Are you sure you want to delete?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: "Yes, Proceed",
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#00d2a5',
            customClass: {
                confirmButton: 'green-bg-white-f-btn'
            },
            focusConfirm: false,
            focusCancel: true
        }).then((result) => {
            if (result.value) {
                try {
                    apiInterPreterService.deleteAssignment(id).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Interpreter deleted successfully"
                                })
                                setAssignmentDetails(prevAssignmentDetails => {
                                    const newAssignmentDetails = [...prevAssignmentDetails];
                                    newAssignmentDetails.splice(index, 1);
                                    return newAssignmentDetails;
                                });

                            } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Unauthorized Access"
                                })
                            } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Please revalidate the form and submit"
                                })
                            } else {
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Something went wrong. Please try again!"
                                })
                            }
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "No response from the server. Please try again!"
                            })
                        }
                    });
                } catch {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    })
                }
            }
        })
    }, []);

    const onChangeHandler = useCallback((event) => {
        setSelectedFile('');
        validateUploadedFile(event.target.files[0]);
    }, []);

    const addEventToggleModal = useCallback(() => {
        setIsAddEventModalOpen(prev => !prev);
        setDisableSaveMaterialBtn(false);
        setSelectedFile('');
        setFileFormatErrorMsg('');
    }, []);

    const saveUploadedFileDetails = useCallback((data) => {
        if (data && data !== undefined && data !== null && data !== "") {
            let extension = data.originalname.substr(data.originalname.lastIndexOf(".") + 1);
            let uploadedFileDetails = {
                filename: data.filename,
                originalFilename: data.originalname,
                mime: data.mimetype,
                path: data.path,
                extension: extension,
                status: 1,
                size: data.size,
                event_id: eventID
            }

            apiInterPreterService.addEventMaterials(uploadedFileDetails).then((data) => {
                addEventToggleModal();
                setDisableSaveMaterialBtn(false);

                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "Event Materials Added Successfully"
                        })

                        setEventMaterials(prevEventMaterials => [data.data.result, ...prevEventMaterials]);
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Unauthorized Access"
                        })
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Please revalidate the form and submit"
                        })
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    })
                }
            });
        }
    }, [eventID, addEventToggleModal]);

    const validateUploadedFile = useCallback(async (file) => {
        setFileFormatErrorMsg('');
        const types = [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint",
            "application/pdf",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                setFileFormatErrorMsg(file.name + " File format not supported");
            } else if (file['size'] > 5368709120) {
                setFileFormatErrorMsg('5 GB file size exceeds');
            } else {
                setSelectedFile(file);
            }
        } else {
            setFileFormatErrorMsg("Please upload file");
        }
    }, []);

    const onClickHandler = useCallback(() => {
        if (selectedFile !== "") {
            const data = new FormData()
            data.append('file', selectedFile);
            setDisableSaveMaterialBtn(true);
            apiInterPreterService.uploadFile(data, eventID).then((data) => {
                setDisableSaveMaterialBtn(false);

                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "File Uploaded Successfully"
                        });
                        setSelectedFile('');
                        saveUploadedFileDetails(data.data);
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Unauthorized Access"
                        })
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Please revalidate the form and submit"
                        })
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    })
                }
            });
        } else {
            setFileFormatErrorMsg('Please upload a file');
        }
    }, [selectedFile, eventID, saveUploadedFileDetails]);

   

    const viewEventToggleModal = useCallback(() => {
        setIsViewEventModalOpen(prev => !prev);
    }, []);

    const viewFiles = useCallback((materialDetails) => {
        window.open(
            // eslint-disable-next-line no-undef
            (process.env.REACT_APP_API_IMAGE_URL || '') + materialDetails.path,
            '_blank'
        );
    }, []);

    const assignmentForm = useCallback(({
        values,
        handleBlur,
        handleSubmit,
        handleReset,
        setFieldValue,
    }) => {
        return (
            <React.Fragment>
                <Form onSubmit={handleSubmit}>
                    <div className="">
                        <div className="intrepreter-popup-modal">
                            <div className="d-flex justify-content-end popup-close-btn" onClick={() => { closeAssignmentModal(); handleReset(); }}>&times;</div>
                            <div className="popup-content-assignment">
                                <div className="lang-header mt10">Add Interpreter</div>
                                {!values.translationAi && <div className="d-flex interpre-blk">
                                    <div className="lang-wraper mr15 chip-multiselect">
                                        <div className="room-name-label">Name<span className="star-imp">*</span></div>
                                        <Field type="text" maxLength="200" name="interpreterName" className="form-input modal-form-input" />
                                        <ErrorMessage name="interpreterName" component="div" className="validtxt_msg" />
                                    </div>
                                    <div className="lang-wraper">
                                        <div className="room-name-label">Email<span className="star-imp">*</span></div>
                                        <Field type="text" maxLength="1500" name="emailId" className="form-input modal-form-input" />
                                        <ErrorMessage name="emailId" component="div" className="validtxt_msg" />
                                    </div>
                                </div>}
                                {props.eventData.translationAI && <div className="lang-wraper">
                                    <div className="d-flex twoway-selector">
                                        <label className="custom-checkbox">
                                            <input
                                                type="checkbox"
                                                name="translationAi"
                                                value={values.translationAi}
                                                checked={values.translationAi === true ? "checked" : ""}
                                                onChange={() => { setFieldValue('translationAi', !values.translationAi); }}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                        <div className="checkbox-label">AI Translation</div>
                                    </div>
                                </div>}
                                {languages.length > 0 && (
                                    <div className="d-flex interpre-blk">
                                        <div className="lang-wraper mr15">
                                            <div className="room-name-label">From<span className="star-imp">*</span></div>

                                            <Select
                                                name="fromLanguage"
                                                value={values.fromLanguage}
                                                options={languages}
                                                onChange={e => setFieldValue('fromLanguage', e)}
                                                onBlur={handleBlur}
                                                style={{ display: 'block' }}
                                            />
                                            <ErrorMessage name="fromLanguage" component="div" className="validtxt_msg" />
                                        </div>
                                        <div className="lang-wraper">
                                            <div className="room-name-label">To<span className="star-imp">*</span></div>
                                            <Select
                                                name="toLanguage"
                                                value={values.toLanguage}
                                                options={languages}
                                                onChange={e => setFieldValue('toLanguage', e)}
                                                onBlur={handleBlur}
                                                style={{ display: 'block' }}
                                            />
                                            <ErrorMessage name="toLanguage" component="div" className="validtxt_msg" />
                                        </div>
                                    </div>
                                )}
                                <div className="validtxt_msg" >{errorMsg} </div>
                                <div className="d-flex align-items-center interpre-blk">
                                    <div className="lang-wraper mr15 select-sess">
                                        <div className="room-name-label">Session<span className="star-imp">*</span></div>
                                        <Select
                                            name="session"
                                            value={values.session}
                                            onChange={e => setFieldValue('session', e)}
                                            options={sessionRef.current}
                                            onBlur={handleBlur}
                                            isSearchable={false}
                                            isMulti={true}
                                            style={{ display: 'block' }}
                                        />

                                        <div className="validtxt_msg" >{sessionErrorMsg} </div>
                                    </div>
                                    {!values.translationAi && <div className="lang-wraper">
                                        <div className="d-flex twoway-selector">
                                            <label className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="twoWayAllowed"
                                                    disabled={values.translationAi}
                                                    value={values.twoWayAllowed}
                                                    checked={values.twoWayAllowed === true ? "checked" : ""}
                                                    onChange={() => { setFieldValue('twoWayAllowed', !values.twoWayAllowed); }}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                            <div className="checkbox-label">Two-Way Allowed</div>
                                        </div>
                                    </div>}
                                    {!values.translationAi && <div className="lang-wraper">
                                        <div className="d-flex twoway-selector">
                                            <label className="custom-checkbox">
                                                <input
                                                    type="checkbox"
                                                    name="interpreterVideo"
                                                    disabled={values.translationAi}
                                                    value={values.interpreterVideo}
                                                    checked={values.interpreterVideo === true ? "checked" : ""}
                                                    onChange={() => { setFieldValue('interpreterVideo', !values.interpreterVideo); }}
                                                />
                                                <span className="checkmark"></span>
                                            </label>
                                            <div className="checkbox-label">Show Interpreter Video</div>
                                        </div>
                                    </div>}
                                </div>

                                <div className="d-flex justify-content-center modal-btn-blk room-btn-blk">
                                    <button type="button" className="modal-cancel-btn" onClick={() => { closeAssignmentModal(); handleReset() }}>Cancel</button>
                                    {
                                        interpreterId !== undefined && interpreterId !== null && interpreterId !== ""
                                            ?
                                            <button type="submit" className="modal-save-btn" disabled={disableBtn}>
                                                {disableBtn === true ? 'Updating...' : 'Update'}
                                                {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                            </button>
                                            :
                                            <button type="submit" className="modal-save-btn" disabled={disableBtn}>
                                                {disableBtn === true ? 'Submitting...' : 'Submit'}
                                                {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                            </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </React.Fragment>
        )
    }, [closeAssignmentModal, languages, errorMsg, sessionErrorMsg, interpreterId, disableBtn, props.eventData.translationAI]);

    // Effect for componentDidMount
    useEffect(() => {
        console.log("PROPS", props)
        splittedURLRef.current = props.location.pathname.split("/");
        if (splittedURLRef.current[2] !== "" && splittedURLRef.current[2] !== undefined) {
            eventIDRef.current = splittedURLRef.current[2];
            getInterpretersByEventID();
            getEventMaterialsByEventID();
        }
    }, [props.location.pathname]);

    // Effect for componentDidUpdate
    useEffect(() => {
        console.log("UPDATE", props, { assignmentDetails, languages, eventID })
        if (props.eventData._id !== undefined && props.activeTab === '6' && eventID !== props.eventData._id) {
            setEventID(props.eventData._id);
        } else if (props.eventData._id === undefined && props.activeTab === '6') {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
            props.stepToAgenda();
        }
    }, [props.eventData._id, props.activeTab, eventID, props.stepToAgenda]);

    // Effect for languages update
    useEffect(() => {
        if (props.languages !== undefined && languages !== props.languages) {
            setLanguages(props.languages);
            updateInterpreterDetails('language');
        }
    }, [props.languages, languages, updateInterpreterDetails]);

    // Effect for session update
    useEffect(() => {
        if (props.session !== undefined && props.session.length > 0 && sessionRef.current !== props.session) {
            sessionRef.current = props.session;
            updateInterpreterDetails('session');
        }
    }, [props.session, updateInterpreterDetails]);

    return (
        <React.Fragment>
            <div className="interpreter-blk">

                <div className="d-flex interpre-advan-set">
                    <div className="add-room-wrapper assignment-wrap" style={{ 'width': '190px', 'height': '40px' }} onClick={openAssignmentModal}>
                        <div className="d-flex align-items-center add-room-txt"><span className="add-room-plus">+</span>Add Interpreter</div>
                    </div>
                    <div className="add-room-wrapper add-event-interpre" style={{ 'height': '40px' }} onClick={addEventToggleModal}>
                        <div className="d-flex align-items-center add-room-txt"><span className="add-room-plus">+</span>Add Event Material</div>
                    </div>
                    <div className="view-event-mat" style={{ 'width': '190px', 'height': '40px' }} onClick={viewEventToggleModal}>
                        View Event Material
                    </div>
                </div>

                {assignmentDetails.map((value, key) => {
                    let sessionsData = '';
                    let sessionValue = value.session;

                    sessionRef.current !== undefined && sessionRef.current !== null && sessionRef.current !== "" && sessionRef.current.length > 0 && (
                        sessionValue.map((sessions, key) => {
                            if (key === 0) {
                                sessionsData += sessionRef.current.filter(sess => (sess.value === sessions))[0].label;
                            } else {
                                sessionsData += ' , ' + sessionRef.current.filter(sess => (sess.value === sessions))[0].label;
                            }
                            return true;
                        })
                    )
                    let Fromlanguage = ""
                    if (languages.filter(lng => (lng.value === value.from)) !== undefined &&
                        languages.filter(lng => (lng.value === value.from))[0] !== undefined
                        && languages.filter(lng => (lng.value === value.from))[0].label !== undefined) {
                        Fromlanguage = languages.filter(lng => (lng.value === value.from))[0].label

                    }
                    let Tolanguage = ""
                    if (languages.filter(lng => (lng.value === value.to)) !== undefined &&
                        languages.filter(lng => (lng.value === value.to))[0] !== undefined
                        && languages.filter(lng => (lng.value === value.to))[0].label !== undefined) {
                        Tolanguage = languages.filter(lng => (lng.value === value.to))[0].label

                    }
                    return (
                        <div className="d-flex interpre-wraper" key={key}>
                            <div className="interpre-container">
                                <div className="interpre-label">Name</div>
                                <div className="intrepre-val" title={value.name}>{value.name}</div>
                            </div>
                            <div className="interpre-container">
                                <div className="interpre-label">Email</div>
                                <div className="intrepre-val" title={value.email}>{isAIInterpreter(value.email) ? "" : value.email}</div>
                            </div>
                            {Fromlanguage !== undefined && Fromlanguage !== null && Fromlanguage !== "" &&
                                <div className="interpre-container">
                                    <div className="interpre-label">From</div>
                                    <div className="intrepre-val">{Fromlanguage}</div>
                                </div>
                            }
                            {Tolanguage !== undefined && Tolanguage !== null && Tolanguage !== "" &&
                                <div className="interpre-container  session-col">
                                    <div className="interpre-label">To</div>
                                    <div className="intrepre-val">{Tolanguage}</div>
                                </div>
                            }
                            <div className="interpre-container">
                                <div className="interpre-label">Session</div>
                                <div className="intrepre-val" title={sessionsData}>{sessionsData}</div>
                            </div>
                            <div className="interpre-container">
                                {!isAIInterpreter(value.email) && <div className="d-flex aganta-type">
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={value.two_way} readOnly />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Two way allowed</div>
                                </div>}
                            </div>
                            <div className="interpre-container">
                                {!isAIInterpreter(value.email) && <div className="d-flex aganta-type">
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={value.show_video} readOnly />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Show Interpreter Video</div>
                                </div>}
                            </div>
                            {eventIDRef.current !== undefined && eventIDRef.current !== null && eventIDRef.current !== "" && (
                                <div className="interpre-del-blk">
                                    <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => editInterpreter(value)}><img src={editPencilIcon} alt="edit interpreter" /></div>
                                </div>
                            )}
                            <div className="interpre-del-blk">
                                <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => deleteAssignment(value._id, key)}><img src={trashIcon} alt="delete interpreter" /></div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="d-flex align-items-center btn-acn-blk">
                <button type="button" onClick={() => props.stepToAgenda()} className="prev-btn">Prev</button>
                <button type="button" disabled={assignmentDetails.length > 0 ? false : true} onClick={() => props.stepToParticipants(updateUsers)} className="next-btn">Next</button>
            </div>
            <Modal isOpen={isModalOpen} fade={true} centered className={'interpreter-modal-dialog'}>
                <Formik
                    initialValues={initialValuesRef.current}
                    validationSchema={validationSchema}
                    onSubmit={submitAssignment}
                >
                    {assignmentForm}
                </Formik>
            </Modal>
            <Modal isOpen={isViewEventModalOpen} fade={true} centered className={'interpreter-event-view-modal-dialog'}>
                <div className="">
                    <div className="intrepreter-popup">
                        <div className="d-flex justify-content-end popup-close-btn" onClick={viewEventToggleModal}>
                            &times;
                        </div>
                        <div className="popup-content">
                            <div className="lang-header mt10">View Event Material</div>
                            <div className="material-content-wrapper">
                                {eventMaterials.length > 0 ?
                                    eventMaterials.map((material, key) => {
                                        console.log('material', material);

                                        return (
                                            <div key={key} className="d-flex align-items-center justify-content-between material-content-container">
                                                <div className="mat-icon-blk">
                                                    <img src={helper.renderResourceIcon(material.extension)} alt="resourceIcon" />
                                                </div>
                                                <div className="mat-file-name" onClick={() => viewFiles(material)}>{material.originalFilename}</div>
                                                <div className="d-flex align-items-center justify-content-center material-del-btn">
                                                    <img src={trashIcon} alt="trash" onClick={() => deleteMaterial(material._id, key)} />
                                                </div>
                                            </div>
                                        )
                                    })

                                    : <div className="norecordsEvent">No records available</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isAddEventModalOpen} fade={true} centered className={'single-modal-content'}>
                <div className="">
                    <div className="">
                        <div className="d-flex justify-content-end popup-close-btn" onClick={addEventToggleModal}>
                            &times;
                        </div>
                        <div className="popup-content">
                            <div className="lang-header mt10">Add Event Material</div>
                            <div className="d-flex justify-content-center align-items-center flex-column material-upload-session">
                                <div className="mat-upload-icon">
                                    <img src={uploadIcon} alt="upload" />
                                </div>
                                <div className="seperator-mat">or</div>
                                <div className="add-mater-blk">
                                    <label className="add-mat-btn"><input type="file" className="d-none" onChange={onChangeHandler} />Browse</label>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="mat-info">!</div>
                                <div className="mat-file-types">File formats should be .pdf, .doc, .docx, .xls, .xlsx or .ppt</div>
                            </div>
                            {selectedFile !== "" &&
                                <div className="d-flex align-items-center">
                                    <div className="mat-file-types"> {selectedFile.name}</div>
                                </div>}
                            <span className="mat-file-types text-danger">{fileFormatErrorMsg}</span>
                            <div className="d-flex justify-content-center modal-btn-blk interpre-btn-blk">
                                <button type="button" className="modal-cancel-btn" onClick={addEventToggleModal}>Cancel</button>
                                <button type="button" className="modal-save-btn" onClick={onClickHandler} disabled={disableSaveMaterialBtn}>
                                    {disableSaveMaterialBtn === true ? 'Saving...' : 'Save'}
                                    {disableSaveMaterialBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    );
}

