import React, { useState, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import apiEventService from "@/service/event/eventService";
import ClipLoader from "react-spinners/ClipLoader";
import { Toast } from "@/components/toastComponent";
import apiEventUserService from "@/service/event/eventUserService";
import apiEventUploadService from "@/service/event/eventUploadService";
import debounce from "lodash/debounce";
import { REACT_APP_MEETING_LINK_INTERPRETER, REACT_APP_MEETING_LINK_LEARNER, REACT_APP_MEETING_LINK_MODERATOR, REACT_APP_MEETING_LINK_SECONDARY_MODERATOR, REACT_APP_MEETING_LINK_SIGNLANGUAGE, REACT_APP_MEETING_LINK_SPEAKER, REACT_APP_MEETING_LINK_STREAMOUT } from "@/constants/URLConstant";
import readXlsxFile from 'read-excel-file';

const Participants = (props) => {
    const [eventData, setEventData] = useState([]);
    const [speakerUsers, setSpeakerUsers] = useState([]);
    const [viewerUsers, setViewerUsers] = useState([]);
    const [speakerLoader, setSpeakerLoader] = useState(false);
    const [listnerLoader, setListnerLoader] = useState(false);
    const [speakerSave, setSpeakerSave] = useState(false);
    const [speakerSaveLoader, setSpeakerSaveLoader] = useState(false);
    const [listenerSaveloader, setListenerSaveloader] = useState(false);
    const [listenerSave, setListenerSave] = useState(false);
    const [callUserFn, setCallUserFn] = useState(false);

    const getImportedSpeakers = useCallback(() => {
        let checkEventJoiningUserDetails = {
            event_id: props.eventData._id,
            speaker_status: true,
            back_end_user: true,
            role: 'speaker'
        }
        apiEventUserService.checkEventUserDetailsExists(checkEventJoiningUserDetails).then((data) => {
            try {
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        let speakerUsers = data.data.data;
                        if (speakerUsers !== undefined && speakerUsers.length > 0) {
                            let speakerEmail = []
                            speakerUsers.map((users) => {
                                return speakerEmail.push(users.email)
                            })
                            setSpeakerUsers(speakerEmail);
                            document.getElementById('speaker_users_textarea').value = speakerEmail.join(';');
                        } else {
                            document.getElementById('speaker_users_textarea').value = "";
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again"
                    })
                }
            } catch (e) {
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again"
                })
            }
        })
    }, [props.eventData._id]);

    const getImportedLearners = useCallback(() => {
        let checkEventJoiningUserDetails = {
            event_id: props.eventData._id,
            listener_status: true,
            back_end_user: true,
            role: 'listener'
        }
        apiEventUserService.checkEventUserDetailsExists(checkEventJoiningUserDetails).then((data) => {
            try {
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        let listenerUsers = data.data.data;
                        if (listenerUsers !== undefined && listenerUsers.length > 0) {
                            let listenerEmail = []
                            listenerUsers.map((users) => {
                                return listenerEmail.push(users.email)
                            })
                            setViewerUsers(listenerEmail);
                            document.getElementById('viewer_users_textarea').value = listenerEmail.join(';');
                        } else {
                            document.getElementById('viewer_users_textarea').value = ""
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again"
                    })
                }
            } catch (e) {
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again"
                })
            }
        })
    }, [props.eventData._id]);

    useEffect(() => {
        if (props.eventData._id !== undefined && props.activeTab === '7') {
            setEventData(props.eventData);

            if (props.eventData._id !== eventData._id && props.activeTab === '7') {
                getImportedSpeakers();
                getImportedLearners();
            } else if (props.flag !== undefined && props.flag === true) {
                if (callUserFn === false) {
                    setCallUserFn(true);
                    getImportedSpeakers();
                    getImportedLearners();
                }
            }
        } else if (props.eventData._id === undefined && props.activeTab === '7') {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
            props.stepToInterpreter();
        }

        let password = (props.eventData.password !== undefined && props.eventData.password !== null && props.eventData.password !== "") ? props.eventData.password : "";
        const passwordElement = document.getElementById("rafiky-user-password");
        if (passwordElement) {
            passwordElement.value = password;
        }
    }, [props.eventData, props.activeTab, props.flag, eventData._id, callUserFn, getImportedSpeakers, getImportedLearners, props]);

    const copyLink = (link) => {
        navigator.clipboard.writeText(link);
        Toast.fire({
            icon: 'success',
            title: 'Link copied successfully'
        })
    }

    const finishEvent = () => {
        let password = "";
        password = document.getElementById("rafiky-user-password").value;
        let eventParams = {
            'password': password,
            'finish': true,
            '_id': eventData._id
        }
        apiEventService.updateEventDetails(eventParams).then((data) => {
            if (data && data !== undefined && data !== null && data !== "") {
                if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    Toast.fire({
                        icon: 'success',
                        title: "Event Updated Successfully"
                    })
                    props.history.push("/events");
                    props.saveEventDetails(data.data);
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

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const uploadExcel = (params) => {
        if (params === 'speaker') {
            setSpeakerLoader(true);
            setSpeakerSave(false);
            document.getElementById("speaker-email-error").innerHTML = "";
            let input = document.getElementById('speaker_users');
            let speakerEmail = [];
            const ext = ['.xls', '.xlsx'];
            if (input.files[0] !== undefined && input.files[0] !== null) {
                let filextension = ext.some(el => input.files[0].name.endsWith(el));
                if (filextension === true) {
                    try {
                        let speakers = speakerUsers;
                        let invalidEmail = []
                        readXlsxFile(input.files[0]).then((rows) => {
                            try {
                                rows.map((value, key) => {
                                    if (key !== 0 && rows[0] !== undefined && rows[0][0].toLowerCase() === 'email') {
                                        if (validateEmail(value) === true) {
                                            document.getElementById("speaker-email-error").innerHTML = "";
                                            speakerEmail.push(value);
                                            if (key + 1 === rows.length) {
                                                setSpeakerLoader(false);
                                                setSpeakerSave(true);
                                                let allspeakers = [...speakerEmail, ...speakers];
                                                let uniqueArray = allspeakers.join(',');
                                                uniqueArray = uniqueArray.split(',')
                                                uniqueArray = uniqueArray.map(v => v.toLowerCase());

                                                let uniqueSpeakers = uniqueArray.filter(function (item, pos) {
                                                    return uniqueArray.indexOf(item) === pos;
                                                })
                                                if (invalidEmail.length > 0) {
                                                    document.getElementById("speaker-email-error").innerHTML = "Invalid email are (not imported. Please enter manually):" + invalidEmail.join(';');
                                                }
                                                document.getElementById('speaker_users_textarea').value = uniqueSpeakers.join(';');
                                            }
                                        } else {
                                            invalidEmail.push(value);
                                            if (key + 1 === rows.length && invalidEmail.length > 0) {
                                                document.getElementById("speaker-email-error").innerHTML = "Invalid email :" + invalidEmail.join(';');
                                            }
                                        }
                                    } else {
                                        setSpeakerLoader(false);
                                        setSpeakerSave(false);
                                        document.getElementById("speaker-email-error").innerHTML = "Please upload valid excel";
                                    }
                                    return true;
                                })
                            } catch (error) {
                                console.log(error);
                                setSpeakerLoader(false);
                                setSpeakerSave(false);
                                document.getElementById("speaker-email-error").innerHTML = "Something went wrong. Please try again!";
                            }
                        }).catch(err => {
                            setSpeakerLoader(false);
                            setSpeakerSave(false);
                            document.getElementById("speaker-email-error").innerHTML = "File size exceeds"
                        })
                    } catch (error) {
                        console.log(error);
                        setSpeakerLoader(false);
                        setSpeakerSave(false);
                        document.getElementById("speaker-email-error").innerHTML = "Something went wrong. Please try again!";
                    }
                } else {
                    setSpeakerLoader(false);
                    setSpeakerSave(false);
                    document.getElementById("speaker-email-error").innerHTML = "Please upload excel file";
                }
            } else {
                setSpeakerLoader(false);
                setSpeakerSave(false);
                document.getElementById("speaker-email-error").innerHTML = "Please upload a valid excel file";
            }
        } else if (params === 'viewer') {
            setListnerLoader(true);
            document.getElementById("viewer-email-error").innerHTML = "";
            let input = document.getElementById('viewer_users');
            let viewerEmail = [];
            const ext = ['.xls', '.xlsx'];
            if (input.files[0] !== undefined && input.files[0] !== null) {
                let filextension = ext.some(el => input.files[0].name.endsWith(el));
                if (filextension === true) {
                    try {
                        let invalidEmail = []
                        readXlsxFile(input.files[0]).then((rows) => {
                            try {
                                rows.map((value, key) => {
                                    if (key !== 0 && rows[0] !== undefined && rows[0][0].toLowerCase() === 'email') {
                                        if (validateEmail(value) === true) {
                                            document.getElementById("viewer-email-error").innerHTML = "";
                                            viewerEmail.push(value);
                                            if (key + 1 === rows.length) {
                                                setListnerLoader(false);
                                                setListenerSave(true);
                                                let allviewers = [...viewerEmail, ...viewerUsers];
                                                let uniqueArray = allviewers.join(',');
                                                uniqueArray = uniqueArray.split(',')
                                                uniqueArray = uniqueArray.map(v => v.toLowerCase());

                                                let uniquesViewers = uniqueArray.filter(function (item, pos) {
                                                    return uniqueArray.indexOf(item) === pos;
                                                })
                                                if (invalidEmail.length > 0) {
                                                    document.getElementById("viewer-email-error").innerHTML = "Invalid email are (not imported. Please enter manually):" + invalidEmail.join(';');
                                                }
                                                document.getElementById('viewer_users_textarea').value = uniquesViewers.join(';');
                                            }
                                        } else {
                                            invalidEmail.push(value)
                                            if (key + 1 === rows.length) {
                                                document.getElementById("viewer-email-error").innerHTML = "Invalid email :" + invalidEmail.join(';');
                                            }
                                        }
                                    } else {
                                        setListnerLoader(false);
                                        setListenerSave(false);
                                        document.getElementById("viewer-email-error").innerHTML = "Please upload valid excel";
                                    }
                                    return true;
                                })
                            } catch (error) {
                                setListnerLoader(false);
                                setListenerSave(false);
                                document.getElementById("viewer-email-error").innerHTML = "Something went wrong. Please try again!";
                            }
                        }).catch(err => {
                            setListnerLoader(false);
                            setListenerSave(false);
                            document.getElementById("viewer-email-error").innerHTML = "File size exceeds"
                        })
                    } catch (error) {
                        setListnerLoader(false);
                        setListenerSave(false);
                        document.getElementById("viewer-email-error").innerHTML = "Something went wrong. Please try again!";
                    }
                } else {
                    setListnerLoader(false);
                    setListenerSave(false);
                    document.getElementById("viewer-email-error").innerHTML = "Please upload excel file";
                }
            } else {
                setListnerLoader(false);
                setListenerSave(false);
                document.getElementById("speaker-email-error").innerHTML = "Please upload a valid excel file";
            }
        }
    }

    const checkImportedUserList = (type, flag = 0) => {
        let users = ""
        if (type === 'speaker') {
            users = document.getElementById('speaker_users_textarea').value;
            document.getElementById("speaker-email-error").innerHTML = "";
        } else {
            users = document.getElementById('viewer_users_textarea').value;
            document.getElementById("viewer-email-error").innerHTML = "";
        }
        let userArrayFilterd = [];
        if (users.trim() !== "") {
            let userArray = users.split(';');

            userArrayFilterd = userArray.filter(function (el) { return el.trim() !== ""; });
            userArrayFilterd = userArrayFilterd.map(v => v.toLowerCase());
            let errorEmail = [];
            if (userArrayFilterd.length > 0) {
                for (let index = 0; index < userArrayFilterd.length; index++) {
                    let userEmail = userArrayFilterd[index].trim();
                    let validation = validateEmail(userEmail);

                    if (validation === false) {
                        errorEmail.push(userEmail);
                    }

                    if (userArrayFilterd.length === index + 1) {
                        let listedUsers = userArrayFilterd.filter(function (item, pos) {
                            return userArrayFilterd.indexOf(item) === pos;
                        })
                        if (errorEmail.length > 0) {
                            if (type === 'speaker') {
                                setSpeakerLoader(false);
                                setSpeakerSave(false);
                                document.getElementById("speaker-email-error").innerHTML = "Invalid email " + errorEmail.join(';');
                            } else {
                                setListnerLoader(false);
                                setListenerSave(false);
                                document.getElementById("viewer-email-error").innerHTML = "Invalid email " + errorEmail.join(';');
                            }
                        } else {
                            if (flag === 1) {
                                return listedUsers;
                            } else {
                                if (type === 'speaker') {
                                    setSpeakerSave(true);
                                    setSpeakerUsers(listedUsers);
                                } else {
                                    setListenerSave(true);
                                    setViewerUsers(listedUsers);
                                }
                            }
                        }
                    }
                }
            } else {
                if (flag === 1) {
                    return userArrayFilterd;
                } else {
                    setSpeakerSave(false);
                    setListenerSave(false);
                }
            }
        } else {
            if (flag === 1) {
                return userArrayFilterd;
            } else {
                if (type === 'speaker') {
                    if (speakerUsers.length > 0) {
                        setSpeakerSave(true);
                    } else {
                        setSpeakerSave(false);
                    }
                } else {
                    if (viewerUsers.length > 0) {
                        setListenerSave(true);
                    } else {
                        setListenerSave(false);
                    }
                }
            }
        }
    }

    const checkImportedUser = useCallback(debounce((type) => {
        checkImportedUserList(type);
    }, 500), [speakerUsers, viewerUsers]);

    const showErrorMsg = (msg) => {
        Swal.fire({
            html: msg,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: "OK",
            confirmButtonColor: '#00d2a5',
            customClass: {
                confirmButton: 'green-bg-white-f-btn'
            },
            focusConfirm: false,
            focusCancel: true
        }).then(() => {
            setSpeakerSave(false);
            setListenerSave(false);
            document.getElementById('speaker_users_textarea').value = "";
            document.getElementById('viewer_users_textarea').value = "";
            getImportedLearners();
            getImportedSpeakers();
        });
    }

    const saveImportedUsers = async (type) => {
        if (type === 'speaker') {
            setSpeakerSaveLoader(true);
            setSpeakerSave(true);
        } else {
            setListenerSaveloader(true);
            setListenerSave(true);
        }

        let userList = await checkImportedUserList(type, 1);
        if (viewerUsers.length > 0 || speakerUsers.length > 0 || userList.length > 0) {
            let eventParams = {
                'user_list': userList,
                'type': type,
                '_id': eventData._id
            }

            apiEventUploadService.uploadEventUsers(eventParams).then((data) => {
                if (type === 'speaker') {
                    setSpeakerSaveLoader(false);
                } else {
                    setListenerSaveloader(false);
                }
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        let errorMessage = "<div>";
                        let errorMessageStatus = false;
                        if (data.data.interpreterError !== undefined && data.data.interpreterError.length > 0) {
                            errorMessageStatus = true;
                            errorMessage += " <br/> <br/> Email already assigned to interpreter  : " + data.data.interpreterError.join(';');
                        }

                        if (data.data.alreadyExistsUserError !== undefined && data.data.alreadyExistsUserError.length > 0) {
                            let listnersArray = []
                            data.data.alreadyExistsUserError.filter(function (item) {
                                if (item.listener_status === true) {
                                    listnersArray.push(item.email)
                                }
                                return true
                            });
                            let speakerArray = []
                            data.data.alreadyExistsUserError.filter(function (item) {
                                if (item.speaker_status === true) {
                                    speakerArray.push(item.email)
                                }
                                return true
                            });

                            if (type === 'speaker') {
                                if (listnersArray.length > 0) {
                                    errorMessageStatus = true;
                                    errorMessage += " <br/> <br/> Email already assigned to Listener  : " + listnersArray.join(';');
                                }
                            } else {
                                if (speakerArray.length > 0) {
                                    errorMessageStatus = true;
                                    errorMessage += " <br/> <br/> Email already assigned to speaker  : " + speakerArray.join(';');
                                }
                            }
                        }
                        errorMessage += "</div>";
                        if (errorMessageStatus === true) {
                            showErrorMsg(errorMessage)
                        } else {
                            document.getElementById('speaker_users_textarea').value = "";
                            document.getElementById('viewer_users_textarea').value = "";
                            getImportedLearners();
                            getImportedSpeakers();
                            if (type === 'speaker') {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Speaker Updated Successfully"
                                })
                                setSpeakerSave(false);
                            } else {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Listener Updated Successfully"
                                })
                                setListenerSave(false);
                            }
                        }
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
            if (type === 'speaker') {
                setSpeakerSaveLoader(false);
                document.getElementById("speaker-email-error").innerHTML = "No User Added";
            } else {
                setListenerSaveloader(false);
                document.getElementById("viewer-email-error").innerHTML = "No User Added";
            }
        }
    }

    return (
        <React.Fragment>
            <div className="participants-blk">
                <div className="meeting-links-header">
                    View Meeting Links
                </div>
                <div className="meeting-links-wrapper">
                    <div className="meeting-links-container">
                        <div className="meeting-link-subheader">Moderator Link :</div>
                        <div className="d-flex align-items-center link-url-wrapper">
                            <div className="link-url-type">{REACT_APP_MEETING_LINK_MODERATOR + eventData.event_code}</div>
                            <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_MODERATOR + eventData.event_code)}>Copy Link</div>
                        </div>
                        <div className="formgrp-txt-wrapper pass-field">
                            <label className="formgrp-label">Password</label>
                            <input name="eventPassword" id="rafiky-user-password" type="text" maxLength="50" className="form-input" placeholder="Enter Password" />
                        </div>
                        <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div><br/>
                        {
                            eventData.enableSecondaryModerator === true && (
                                <span>
                                    <div className="meeting-link-subheader">Secondary Moderator Link :</div>
                                    <div className="d-flex align-items-center link-url-wrapper">
                                        <div className="link-url-type">{REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + eventData.event_code}</div>
                                        <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + eventData.event_code)}>Copy Link</div>
                                    </div>
                                </span>
                            )
                        }
                    </div>
                    <div className="meeting-links-container speaker">
                        <div className="meeting-link-subheader">Speaker Link :</div>
                        <div className="d-flex align-items-center link-url-wrapper">
                            <div className="link-url-type">{REACT_APP_MEETING_LINK_SPEAKER + eventData.event_code}</div>
                            <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SPEAKER + eventData.event_code)}>Copy Link</div>
                        </div>

                        <div className="formgrp-txt-wrapper pass-field">
                            <label className="formgrp-label">Import Speakers (eg: example@gmail.com;)</label>
                            <div className="d-flex justify-content-between import-users-blk">
                                <textarea className="form-input" id="speaker_users_textarea" onChange={() => { checkImportedUser('speaker') }} />
                                <div className="add-mater-blk">
                                    {speakerSave ? speakerSaveLoader ? <label className="add-mat-btn formgrp-label">Saving...  <ClipLoader size={15} color={"#fff"} loading={true} /></label> : <label className="add-mat-btn formgrp-label" onClick={() => saveImportedUsers('speaker')}>Save</label> :
                                        speakerLoader ? <label className="add-mat-btn formgrp-label"> Importing... <ClipLoader size={15} color={"#fff"} loading={true} /></label> :
                                            <label className="add-mat-btn formgrp-label"><input type="file" id="speaker_users" className="d-none" onChange={() => uploadExcel('speaker')} />Import</label>
                                    }
                                </div>
                            </div>
                            <label className="formgrp-label" style={{marginTop:'10px'}}>NOTE: If the textbox for uploading a list is blank or without any xlsx file uploaded,<br /> the events remain "free to join" </label>
                            <span id="speaker-email-error" className="text-danger"></span>
                        </div>
                        <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div>
                    </div>
                    <div className="meeting-links-container">
                        <div className="meeting-link-subheader">Interpreter Link :</div>
                        <div className="d-flex align-items-center link-url-wrapper">
                            <div className="link-url-type">{REACT_APP_MEETING_LINK_INTERPRETER + eventData.event_code}</div>
                            <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_INTERPRETER + eventData.event_code)}>Copy Link</div>
                        </div>

                        <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div>
                    </div>
                    <div className="meeting-links-container viewer">
                        <div className="meeting-link-subheader">Viewer Link :</div>
                        <div className="d-flex align-items-center link-url-wrapper">
                            <div className="link-url-type">{REACT_APP_MEETING_LINK_LEARNER + eventData.event_code}</div>
                            <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_LEARNER + eventData.event_code)}>Copy Link</div>
                        </div>
                        <div className="formgrp-txt-wrapper pass-field">
                            <label className="formgrp-label">Import Viewers (eg: example@gmail.com;)</label>
                            <div className="d-flex justify-content-between import-users-blk">
                                <textarea className="form-input" id="viewer_users_textarea" onChange={() => { checkImportedUser('viewer') }} />

                                <div className="add-mater-blk">
                                    {listenerSave ? listenerSaveloader ? <label className="add-mat-btn formgrp-label">Saving...  <ClipLoader size={15} color={"#fff"} loading={true} /></label> : <label className="add-mat-btn formgrp-label" onClick={() => saveImportedUsers('viewer')}>Save</label> : listnerLoader ? <label className="add-mat-btn formgrp-label"> Importing... <ClipLoader size={15} color={"#fff"} loading={true} /></label> :
                                        <label className="add-mat-btn formgrp-label"><input type="file" id="viewer_users" className="d-none" onChange={() => uploadExcel('viewer')} />Import</label>
                                    }

                                </div>
                            </div>
                            <label className="formgrp-label" style={{ marginTop: '10px' }}>NOTE: If the textbox for uploading a list is blank or without any xlsx file uploaded, <br /> the events remain "free to join" </label>
                            <span id="viewer-email-error" className="text-danger"></span>
                        </div>
                        <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div>
                    </div>

                    {eventData.streamOut !== undefined && eventData.streamOut !== null && eventData.streamOut && (
                        <div className="meeting-links-container">
                            <div className="meeting-link-subheader">Stream Out Link :</div>
                            <div className="d-flex align-items-center link-url-wrapper">
                                <div className="link-url-type">{REACT_APP_MEETING_LINK_STREAMOUT + eventData.event_code}</div>
                                <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_STREAMOUT + eventData.event_code)}>Copy Link</div>
                            </div>
                            <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div>
                        </div>
                    )}

                    {eventData.signLanguageMode !== undefined && eventData.signLanguageMode !== null && eventData.signLanguageMode && (
                        <div className="meeting-links-container">
                            <div className="meeting-link-subheader">Sign Language Link :</div>
                            <div className="d-flex align-items-center link-url-wrapper">
                                <div className="link-url-type">{REACT_APP_MEETING_LINK_SIGNLANGUAGE + eventData.event_code}</div>
                                <div className="link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SIGNLANGUAGE + eventData.event_code)}>Copy Link</div>
                            </div>
                            <div className="meeting-link-code">Meeting Code : <span>{eventData.event_code}</span></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="d-flex align-items-center btn-acn-blk">
                <button type="button" onClick={() => props.stepToInterpreter()} className="prev-btn">Prev</button>
                <button type="button" onClick={() => finishEvent()} className="next-btn">Finish</button>
            </div>
        </React.Fragment>
    )
}

export default Participants;