import React, { useState, useEffect, useCallback, useRef } from "react";
import Swal from 'sweetalert2';
import ClipLoader from "react-spinners/ClipLoader";
import apiEventService from "@/service/event/eventService";
import {Axioslib} from "@/service/api";
import { Formik, Form, Field } from "formik";
import { Toast } from "@/components/toastComponent";
import apiEventUploadService from "@/service/event/eventUploadService";
import videoIcon from "@/assets/img/vdo_icon.png";
import pptIcon from "@/assets/img/mspowerpoint.png";
import trashIcon from "@/assets/img/trash.svg";
import NoData from '@/assets/img/no-data.svg';
import MsPowerPoint from '@/assets/img/mspowerpoint.png';

const Eventfiles = (props) => {
    const [eventFiles, setEventFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState("");
    const [selectedFilePPT, setSelectedFilePPT] = useState("");
    const [loaded, setLoaded] = useState(0);
    const [loadedPPT, setLoadedPPT] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [errorMsgPPT, setErrorMsgPPT] = useState('');
    const [errorUrlMsg, setErrorUrlMsg] = useState("");
    const [disableNextBtn, setDisableNextBtn] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);
    const [initialValues, setInitialValues] = useState({
        streamOut: false,
        signLanguageMode: false,
        recording: false,
        speakerUserList: false,
        enableDownloadPpt: false,
        enableHighResolution: false,
        enableSecondaryModerator: false,
        enableMasterSpeaker: false,
        translationAI: false,
        disablePublicCL: false,
        disablePublicCS: false,
        disablePrivateCL: false,
        disablePrivateCS: false,
        enablePopupNot: false,
        disableChat: false
    });
    
    const eventIDRef = useRef("");
    const splittedURLRef = useRef([]);

    // Initialize eventID from URL
    useEffect(() => {
        splittedURLRef.current = props.location.pathname.split("/");
        if (splittedURLRef.current[2] !== "" && splittedURLRef.current[2] !== undefined) {
            eventIDRef.current = splittedURLRef.current[2];
            getEventFilesByEventID();
        }
    }, [props.location.pathname]);

    // Update initialValues when eventData changes
    useEffect(() => {
        console.log("props.eventData", props.eventData);
        setInitialValues(prev => ({
            ...prev,
            ...props.eventData
        }));
    }, [props.eventData]);

    // Handle eventID and activeTab changes
    useEffect(() => {
        if (props.eventData._id !== undefined && props.activeTab === '2' && eventIDRef.current !== props.eventData._id) {
            eventIDRef.current = props.eventData._id;
        } else if (props.eventData._id === undefined && props.activeTab === '2') {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
            props.stepToEvent();
        }
    }, [props.eventData._id, props.activeTab]);

    const getEventFilesByEventID = useCallback(() => {
        let params = {
            event_id: eventIDRef.current
        }
        apiEventUploadService.getEventFilesByEventID(params).then((data) => {
            if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                if (data.data.data !== "" && data.data.data !== undefined) {
                    setEventFiles(data.data.data);
                }
            } else {
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again!"
                })
            }
        });
    }, []);

    const onChangeHandler = (event) => {
        if (selectedFile !== "") {
            Toast.fire({
                icon: 'warning',
                title: "Please wait. File is being uploading"
            })
        } else {
            setErrorMsg('');
            let types = [
                "video/mp4",
                "audio/mp3",
                "audio/mpeg"
            ];

            const selectedFileData = event.target.files[0];

            if (selectedFileData !== "") {
                if (types.every(type => selectedFileData.type !== type)) {
                    setErrorMsg(selectedFileData.name + " File format not supported");
                } else if (selectedFileData['size'] > 524288000) {
                    setErrorMsg('500 MB file size exceeds');
                } else {
                    setSelectedFile(selectedFileData);
                    setLoaded(0);
                    
                    const data = new FormData();
                    data.append('event_file', selectedFileData);
                    try {
                        Axioslib.post("event/upload_file/" + eventIDRef.current, data, {
                            onUploadProgress: ProgressEvent => {
                                setLoaded(ProgressEvent.loaded / ProgressEvent.total * 100);
                            },
                        }).then(response => {
                            document.getElementById("uploadeventfile").value = "";

                            if (response && response !== undefined && response !== null && response !== "" && response.status && response.status !== undefined && response.status !== null && response.status === 200) {
                                
                                if (response.data.status !== "" && response.data.status !== undefined && response.data.status === "success") {
                                    Toast.fire({
                                        icon: 'success',
                                        title: "Event file uploaded"
                                    })
                                    let filename = selectedFileData.name;
                                    let saveEventFiles = {
                                        title: filename,
                                        url: response.data.result,
                                        type: selectedFileData.type,
                                        event_id: eventIDRef.current
                                    }
                                    saveEventFileDetails(saveEventFiles, "audiovideo");

                                } else if (response.data.status !== "" && response.data.status !== undefined && response.data.status === "failed") {
                                    setSelectedFile("");
                                    Toast.fire({
                                        icon: 'warning',
                                        title: response.data.message
                                    })
                                } else {
                                    setSelectedFile("");
                                    Toast.fire({
                                        icon: 'warning',
                                        title: "Upload failed. Please try again!"
                                    })
                                }
                            } else {
                                setSelectedFile("");
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Upload failed. Please try again!"
                                })
                            }
                        }, error => {
                            document.getElementById("uploadeventfile").value = "";
                            setSelectedFile("");
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong. Please try again!"
                            })
                        });
                    } catch (e) {
                        document.getElementById("uploadeventfile").value = "";
                        setSelectedFile("");
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                }
            } else {
                setErrorMsg("Please upload file");
            }
        }
    };

    const onPPTChangeHandler = (event) => {
        if (selectedFilePPT !== "") {
            Toast.fire({
                icon: 'warning',
                title: "Please wait. File is being uploading"
            })
        } else {
            setErrorMsgPPT('');
            let types = [
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-powerpoint",
                "application/powerpoint",
                "application/mspowerpoint",
                "application/x-mspowerpoint"
            ];

            console.log("event.target.files ===> ", event.target.files);

            const selectedFilePPTData = event.target.files[0];

            console.log("selectedFilePPTData ===> ", selectedFilePPTData);

            if (selectedFilePPTData !== "") {
                if (types.every(type => selectedFilePPTData.type !== type)) {
                    setErrorMsgPPT(selectedFilePPTData.name + " File format not supported");
                } else if (selectedFilePPTData['size'] > 52428800) {
                    setErrorMsgPPT('50 MB file size exceeds');
                } else {
                    setSelectedFilePPT(selectedFilePPTData);
                    setLoadedPPT(0);
                    
                    const data = new FormData();
                    data.append('event_file', selectedFilePPTData);
                    try {
                        Axioslib.post("event/upload_file/" + eventIDRef.current, data, {
                            onUploadProgress: ProgressEvent => {
                                setLoadedPPT(ProgressEvent.loaded / ProgressEvent.total * 100);
                            },
                        }).then(response => {
                            document.getElementById("uploadeventfile_ppt").value = "";

                            if (response && response !== undefined && response !== null && response !== "" && response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                if (response.data.status !== "" && response.data.status !== undefined && response.data.status === "success") {
                                    if (response.data.result.status === "success") {
                                        Toast.fire({
                                            icon: 'success',
                                            title: "Event file uploaded and Conversion is on progress"
                                        })
                                        setSelectedFilePPT("");
                                        setEventFiles(prev => [response.data.result.result, ...prev]);
                                    } else {
                                        setSelectedFilePPT("");
                                        Toast.fire({
                                            icon: 'warning',
                                            title: "Something went wrong. Please try again!"
                                        })
                                    }
                                } else if (response.data.status !== "" && response.data.status !== undefined && response.data.status === "failed") {
                                    setSelectedFilePPT("");
                                    Toast.fire({
                                        icon: 'warning',
                                        title: response.data.message
                                    })
                                } else {
                                    setSelectedFilePPT("");
                                    Toast.fire({
                                        icon: 'warning',
                                        title: "Upload failed. Please try again!"
                                    })
                                }
                            } else {
                                setSelectedFilePPT("");
                                Toast.fire({
                                    icon: 'warning',
                                    title: "Upload failed. Please try again!"
                                })
                            }
                        }, error => {
                            document.getElementById("uploadeventfile_ppt").value = "";
                            setSelectedFilePPT("");
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong. Please try again!"
                            })
                        }).catch(err => {
                            console.log('errrr', err);
                        });
                    } catch (e) {
                        document.getElementById("uploadeventfile_ppt").value = "";
                        setSelectedFilePPT("");
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                }
            } else {
                setErrorMsgPPT("Please upload file");
            }
        }
    };

    const saveEventFileDetails = (saveEventFiles, browsetype) => {
        if (saveEventFiles !== "" && saveEventFiles !== undefined) {
            apiEventService.saveEventFileDetails(saveEventFiles).then((data) => {
                if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    if (data.data.status !== "" && data.data.status !== undefined && data.data.status === "success") {

                        if(browsetype === "audiovideo") {
                            setSelectedFile("");
                            setEventFiles(prev => [data.data.result, ...prev]);
                        } else if(browsetype === "ppt") {
                            setSelectedFilePPT("");
                            setEventFiles(prev => [data.data.result, ...prev]);
                        } else if(browsetype === "url") {
                            setDisableBtn(false);
                            setEventFiles(prev => [data.data.result, ...prev]);
                        }
                        
                        document.getElementById("mediaInputUrl").value = "";
                        Toast.fire({
                            icon: 'success',
                            title: "Event file saved"
                        })
                    } else if (data.data.status !== "" && data.data.status !== undefined && data.data.status === "error") {
                        document.getElementById("mediaInputUrl").value = "";

                        if (browsetype === "audiovideo") {
                            setSelectedFile("");
                        } else if (browsetype === "ppt") {
                            setSelectedFilePPT("");
                        } else if (browsetype === "url") {
                            setDisableBtn(false);
                        }

                        Toast.fire({
                            icon: 'warning',
                            title: (data.data.message.message !== undefined && data.data.message.message !== null && data.data.message.message !== "") ? data.data.message.message : "Please enter valid URL"
                        })
                    } else {
                        document.getElementById("mediaInputUrl").value = "";

                        if (browsetype === "audiovideo") {
                            setSelectedFile("");
                        } else if (browsetype === "ppt") {
                            setSelectedFilePPT("");
                        } else if (browsetype === "url") {
                            setDisableBtn(false);
                        }

                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong in Event file save"
                        })
                    }
                } else {
                    document.getElementById("mediaInputUrl").value = "";

                    if (browsetype === "audiovideo") {
                        setSelectedFile("");
                    } else if (browsetype === "ppt") {
                        setSelectedFilePPT("");
                    } else if (browsetype === "url") {
                        setDisableBtn(false);
                    }

                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    })
                }
            })
        }
    };

    const deleteEventFile = (id, index) => {
        Swal.fire({
            title: 'Delete Event File',
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
                    let eventfileData = {
                        "event_file_id": id
                    }
                    apiEventService.deleteEventFiles(eventfileData).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Event file deleted successfully"
                                })
                                setEventFiles(prev => {
                                    const updated = [...prev];
                                    updated.splice(index, 1);
                                    return updated;
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
                } catch (e) {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    })
                }
            }
        })
    };

    const addFile = () => {
        setDisableBtn(false);
        setErrorUrlMsg("");
        let addMediaUrl = document.getElementById("mediaInputUrl").value;
        if (addMediaUrl !== "") {
            let title = addMediaUrl.substring(addMediaUrl.lastIndexOf('/') + 1)
            let saveEventFiles = {
                title: title !== "" ? title : 'Sample Document',
                url: addMediaUrl,
                type: "video",
                event_id: eventIDRef.current
            }
            setDisableBtn(true);
            setErrorUrlMsg("");
            saveEventFileDetails(saveEventFiles, "url");
        } else {
            setErrorUrlMsg('Please enter a url');
        }
    };

    const goToPrevStep = () => {
        if (selectedFile !== "" || selectedFilePPT !== "") {
            Toast.fire({
                icon: 'warning',
                title: "Please wait. File is being uploading"
            });
        } else {
            props.stepToEvent();
        }
    };

    const submitEventAdditionServices = (values) => {
        if(selectedFile !== "" || selectedFilePPT !== "") {
            Toast.fire({
                icon: 'warning',
                title: "Please wait. File is being uploading"
            });
        } else {
            let additionalService = {
                'streamOut': values.streamOut,
                'signLanguageMode': values.signLanguageMode,
                'recording': values.recording,
                'speakerUserList': values.speakerUserList,
                'enableDownloadPpt':values.enableDownloadPpt,
                'enableHighResolution':values.enableHighResolution,
                'enableSecondaryModerator':values.enableSecondaryModerator,
                'enableMasterSpeaker':values.enableMasterSpeaker,
                'translationAI': values.translationAI,
                'disablePublicCL':values.disablePublicCL,
                'disablePublicCS':values.disablePublicCS,
                'disablePrivateCL':values.disablePrivateCL,
                'disablePrivateCS':values.disablePrivateCS,
                'enablePopupNot':values.enablePopupNot,
                'disableChat':values.disableChat,
                '_id': eventIDRef.current
            }
            setDisableNextBtn(true);
            apiEventService.updateEventDetails(additionalService).then((data) => {
                setDisableNextBtn(false);
                console.log(data,"data");
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        if (data.data.status === true) {
                            props.saveEventDetails(data.data);
                        }
                        Toast.fire({
                            icon: 'success',
                            title: "Additional Services updated successfully"
                        });
                        props.stepToRoom();
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
    };

    const additionServices = ({
        values,
        handleSubmit,
        setFieldValue
    }) => {
        return (
            <Form onSubmit={handleSubmit}>
                <div className="event-detail-blk">
                    <div className="additional-sevice-blk floatleft">
                        <div className="half-box">
                            <div className="event-main-caption">Additional Services</div>
                            <div className="services-choosing-blk">
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="recording"
                                            value={values.recording}
                                            checked={values.recording === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('recording', !values.recording); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Recording</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="signLanguageMode"
                                            value={values.signLanguageMode}
                                            checked={values.signLanguageMode === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('signLanguageMode', !values.signLanguageMode); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Sign Language Mode</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="streamOut"
                                            value={values.streamOut}
                                            checked={values.streamOut === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('streamOut', !values.streamOut); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Stream Out</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="speakerUserList"
                                            value={values.speakerUserList}
                                            checked={values.speakerUserList === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('speakerUserList', !values.speakerUserList); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Allow Userlist For Speakers</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="enableDownloadPpt"
                                            value={values.enableDownloadPpt}
                                            checked={values.enableDownloadPpt === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('enableDownloadPpt', !values.enableDownloadPpt); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Downloading Of PPT</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="enableHighResolution"
                                            value={values.enableHighResolution}
                                            checked={values.enableHighResolution === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('enableHighResolution', !values.enableHighResolution); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable High Resolution Webcam</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="enableSecondaryModerator"
                                            value={values.enableSecondaryModerator}
                                            checked={values.enableSecondaryModerator === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('enableSecondaryModerator', !values.enableSecondaryModerator); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Secondary Moderator</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="enableMasterSpeaker"
                                            value={values.enableMasterSpeaker}
                                            checked={values.enableMasterSpeaker === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('enableMasterSpeaker', !values.enableMasterSpeaker); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Master Speaker</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="translationAI"
                                            value={values.translationAI}
                                            checked={values.translationAI === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('translationAI', !values.translationAI); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">AI Translation</div>
                                </div>
                            </div>
                        </div>
                        <div className="half-box">
                            <div className="event-main-caption">Chat Settings</div>
                            <div className="services-choosing-blk">
                                <div className="d-flex eventfile-checkbox-wrapper">
                                        <label className="custom-checkbox">
                                            <input type="checkbox"
                                                name="disableChat"
                                                value={values.disableChat}
                                                checked={values.disableChat === true ? "checked" : ""}
                                                onChange={() => { setFieldValue('disableChat', !values.disableChat); }} />
                                            <span className="checkmark"></span>
                                        </label>
                                        <div className="checkbox-label">Disable Chat ( Both private and public chat )</div>
                                </div>
                                <span className={values.disableChat ? 'hide':''}>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="disablePublicCL"
                                            value={values.disablePublicCL}
                                            checked={values.disablePublicCL === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('disablePublicCL', !values.disablePublicCL); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Disable Public Chat For Listeners</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="disablePublicCS"
                                            value={values.disablePublicCS}
                                            checked={values.disablePublicCS === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('disablePublicCS', !values.disablePublicCS); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Disable Public Chat For Speakers</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="disablePrivateCL"
                                            value={values.disablePrivateCL}
                                            checked={values.disablePrivateCL === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('disablePrivateCL', !values.disablePrivateCL); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Disable Private Chat For Listeners</div>
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="disablePrivateCS"
                                            value={values.disablePrivateCS}
                                            checked={values.disablePrivateCS === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('disablePrivateCS', !values.disablePrivateCS); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Disable Private Chat For Speakers</div> 
                                </div>
                                <div className="d-flex eventfile-checkbox-wrapper">
                                    <label className="custom-checkbox">
                                        <input type="checkbox"
                                            name="enablePopupNot"
                                            value={values.enablePopupNot}
                                            checked={values.enablePopupNot === true ? "checked" : ""}
                                            onChange={() => { setFieldValue('enablePopupNot', !values.enablePopupNot); }} />
                                        <span className="checkmark"></span>
                                    </label>
                                    <div className="checkbox-label">Enable Popup Notification For Chat</div>
                                </div>
                                </span>
                            </div>
                        </div>
                      
                    </div>
                    <div className="media-upload-blk floatleft full-width">
                        <div className="event-main-caption">Upload & Share Video</div>
                        <div className="vdo-ppt-upload-blk">
                            <div className="vdo-upload-blk">
                                <div className="upload-vdo-caption">Upload File</div>
                                <div className="d-flex align-items-center justify-content-center vdo-file-uploader" style={{ "flexDirection": "column" }}>
                                    <label className="vdo-file-upload-btn">
                                        <input type="file" id="uploadeventfile" className="d-none" onChange={onChangeHandler} />Browse
                                    </label>
                                    <div className="notification-area" style={{ "marginTop": "1rem" }}>
                                        <div className="notification-text">Supported formats: <span>mp4, mp3</span></div>
                                        <div className="notification-text">Allowed Size: <span>500MB</span></div>
                                    </div>
                                </div>
                                <span className="text-danger">{errorMsg}</span>
                                <div className="media-url-copier-blk">
                                    <div className="media-label">Paste Video URL</div>
                                    <input type="text" placeholder="( Mp4 URL )" className="media-url-input" id="mediaInputUrl" />
                                    <button className="media-add-btn" onClick={addFile} type="button" disabled={disableBtn}>
                                        {disableBtn === true ? 'Adding File...' : 'Add File'}
                                        {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}</button>
                                    <div className="text-danger">{errorUrlMsg}</div>
                                </div>
                                <div className="media-file-list-blk">
                                    {selectedFile !== "" && (
                                        <div className="d-flex align-items-center file-list-container">
                                            <div className="filetype-icon-wrapper filter-img">
                                                <img src={videoIcon} alt="video-icon" />
                                            </div>
                                            <div className="filetype-desc">
                                                <div className="d-flex filename-desc">
                                                    <div className="filename" title={selectedFile['name'] !== undefined ? selectedFile['name'] : ""}>{selectedFile['name'] !== undefined ? selectedFile['name'] : ""}</div>
                                                </div>
                                                <div className="file-upload-progress">
                                                    <div className="progress">
                                                        <div className="progress-bar" role="progressbar" aria-valuenow={loaded} style={{ "width": loaded + "%" }} aria-valuemin="0" aria-valuemax="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="file-upload-close">&times;</div> */}
                                        </div>
                                    )}
                                    {eventFiles.length > 0 ?
                                        eventFiles.map((eventfilesItem, key) => {

                                            let types = [
                                                "video/mp4",
                                                "audio/mp3",
                                                "audio/mpeg",
                                                "mp4",
                                                "mp3",
                                                "MP4",
                                                "MP3",
                                                "audiovideo",
                                                "audio",
                                                "video"
                                            ];

                                            if (types.every(type => eventfilesItem.type !== type)) {
                                                return false;
                                            }
                                            return (
                                                <div className="d-flex align-items-center file-list-container" key={key}>
                                                    <div className="filetype-icon-wrapper">
                                                        <img src={videoIcon} alt="video-icon" />
                                                    </div>
                                                    <div className="filetype-desc">
                                                        <div className="d-flex filename-desc">
                                                            <div className="filename" title={eventfilesItem.title}>{eventfilesItem.title}</div>

                                                        </div>
                                                    </div>
                                                    <div className="file-delete-icon" onClick={() => deleteEventFile(eventfilesItem._id, key)}>
                                                        <img src={trashIcon} alt="trash-icon" />
                                                    </div>
                                                </div>
                                            )
                                        })

                                        : ''}
                                </div>
                            </div>
                            <div className="ppt-upload-blk">
                                <div className="upload-vdo-caption">Upload PPT</div>
                                <div className="ppt-uploader">
                                    <div className="d-flex align-items-center justify-content-center vdo-file-uploader" style={{"flexDirection": "column"}}>
                                        <label className="vdo-file-upload-btn">
                                            <input type="file" id="uploadeventfile_ppt" className="d-none" onChange={onPPTChangeHandler} />Browse
                                        </label>
                                        <div className="notification-area" style={{ "marginTop": "1rem" }}>
                                            <div className="notification-text">Supported formats: <span>ppt, pptx</span></div>
                                            <div className="notification-text">Allowed Size: <span>50MB</span></div>
                                        </div>
                                    </div>
                                    <span className="text-danger">{errorMsgPPT}</span>
                                </div>
                                <div className="media-file-list-blk">
                                    {selectedFilePPT !== "" && (
                                        <div className="d-flex align-items-center file-list-container">
                                            <div className="filetype-icon-wrapper filter-img">
                                                <img src={MsPowerPoint} alt="video-icon" />
                                            </div>
                                            <div className="filetype-desc">
                                                <div className="d-flex filename-desc">
                                                    <div className="filename" title={selectedFilePPT['name'] !== undefined ? selectedFilePPT['name'] : ""}>{selectedFilePPT['name'] !== undefined ? selectedFilePPT['name'] : ""}</div>
                                                </div>
                                                <div className="file-upload-progress">
                                                    <div className="progress">
                                                        <div className="progress-bar" role="progressbar" aria-valuenow={loadedPPT} style={{ "width": loadedPPT + "%" }} aria-valuemin="0" aria-valuemax="100">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="file-upload-close">&times;</div> */}
                                        </div>
                                    )}
                                    {eventFiles.length > 0 ?
                                        eventFiles.map((eventfilesItem, key) => {
                                            let types = [
                                                "ppt",
                                                "pptx",
                                                "PPT",
                                                "PPTX",
                                                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                                "application/vnd.ms-powerpoint",
                                                "application/powerpoint",
                                                "application/mspowerpoint",
                                                "application/x-mspowerpoint"
                                            ];

                                            if (types.every(type => eventfilesItem.type !== type)) {
                                                return false;
                                            }
                                            return (
                                                <div className="d-flex align-items-center file-list-container" key={key}>
                                                    <div className="filetype-icon-wrapper">
                                                        <img src={MsPowerPoint} alt="video-icon" />
                                                    </div>
                                                    <div className="filetype-desc">
                                                        <div className="d-flex filename-desc">
                                                            <div className="filename" title={eventfilesItem.title}>{eventfilesItem.title}</div>

                                                        </div>
                                                    </div>
                                                    <div className="file-delete-icon" onClick={() => deleteEventFile(eventfilesItem._id, key)}>
                                                        <img src={trashIcon} alt="trash-icon" />
                                                    </div>
                                                </div>
                                            )
                                        })

                                        : ''}
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex align-items-center btn-acn-blk">
                    <button type="button" onClick={() => goToPrevStep()} className="prev-btn">Prev</button>
                    {/* <button type="submit" onClick={() => props.stepToRoom()} className="next-btn">Next</button> */}
                    <button type="submit" className="next-btn" disabled={disableNextBtn}>
                        Next {' '}
                        {disableNextBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                    </button>
                </div>
            </Form>
        )
    };

    return (
        <React.Fragment>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                onSubmit={submitEventAdditionServices}
            >
                {additionServices}
            </Formik>
        </React.Fragment>
    );
};

export default Eventfiles;








