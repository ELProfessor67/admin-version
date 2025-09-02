import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "@/service/agenda/agendaService";
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import Select from "react-select";
import ClipLoader from "react-spinners/ClipLoader";
import SessionModal from "@/components/sessionModalComponent";
import { setMinutes, setHours } from "date-fns";
import { Toast } from "@/components/toastComponent";
import editPencilIcon from "@/assets/img/edit-pencil.svg";
import trashIcon from "@/assets/img/trash.svg";

export default function Agenda(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [agendaDetails, setAgendaDetails] = useState([]);
    const [eventID, setEventID] = useState('');
    const [disableBtn, setDisableBtn] = useState(false);
    const [agendaId, setAgendaId] = useState("");
    const [streamOut, setStreamOut] = useState(false);
    const [eventDate, setEventDate] = useState(null);
    const [eventStartTime, setEventStartTime] = useState(null);
    const [eventEndTime, setEventEndTime] = useState(null);
    
    const roomsRef = useRef([]);
    const eventIDRef = useRef("");
    const splittedURLRef = useRef([]);
    const initialValuesRef = useRef({
        sessionName: '',
        session_date: '',
        session_start_time: '',
        session_end_time: '',
        rooms: '',
        privateRoom: false,
        description: '',
        sessionfloorTitle: ''
    });

    const validationSchema = Yup.object().shape({
        sessionName: Yup.string()
            .trim()
            .required("Session Name is required"),
        session_date: Yup.date()
            .required('Start date is required'),
        session_start_time: Yup.date()
            .required('Start Time is required'),
        session_end_time: Yup.date()
            .required('End Time is required').min(Yup.ref('session_start_time'),
                () => 'End time must be greater than start time'),
        rooms: Yup.string().trim().required('Room is required!'),
        sessionfloorTitle: Yup.string()
            .trim()
            .required('Floor title is required!'),
        description: Yup.string()
            .trim()
            .required('Description is required!')
    });

    const getSessionsByEventID = useCallback(() => {
        let params = {
            event_id: eventIDRef.current
        }
        api.getSessionsByEventID(params).then((data) => {
            if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                if (data.data.data !== "" && data.data.data !== undefined) {
                    setAgendaDetails(data.data.data);
                    props.saveSessions(data.data.data);
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "Event not available. Please try again!"
                    })
                }
            } else {
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again!"
                })
            }
        });
    }, [props]);

    const updateSessionDetails = useCallback(() => {
        if (agendaDetails.length > 0) {
            let newSession = [];
            let sessionDetails = agendaDetails;
            sessionDetails.map((session) => {
                if (roomsRef.current.filter(room => (room.value === session.room)) !== undefined
                    && roomsRef.current.filter(room => (room.value === session.room))[0] !== undefined
                    && roomsRef.current.filter(room => (room.value === session.room))[0].label !== undefined) {
                    let roomName = roomsRef.current.filter(room => (room.value === session.room))[0].label;
                    if (roomName !== undefined && roomName !== "") {
                        newSession.push(session);
                    }
                }
                return true;
            });
            let newArray = JSON.stringify(newSession);
            let oldArray = JSON.stringify(agendaDetails);
            if (newArray !== oldArray) {
                setAgendaDetails(newSession);
                props.saveSessions(newSession);
            }
        }
    }, [agendaDetails, props]);

    const openSessionModal = useCallback(() => {
        if (roomsRef.current.length > 0) {
            setIsModalOpen(true);
            setDisableBtn(false);
        } else {
            Toast.fire({
                icon: 'warning',
                title: "No Rooms available. Please refresh page"
            });
        }
    }, []);

    const closeSessionModal = useCallback(() => {
        setIsModalOpen(false);
        setDisableBtn(false);
        setAgendaId("");
        
        initialValuesRef.current.sessionName = "";
        initialValuesRef.current.session_date = "";
        initialValuesRef.current.session_start_time = "";
        initialValuesRef.current.session_end_time = "";
        initialValuesRef.current.rooms = "";
        initialValuesRef.current.privateRoom = false;
        initialValuesRef.current.description = "";
        initialValuesRef.current.sessionfloorTitle = "";
    }, []);

    const addZero = useCallback((i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }, []);

    const submitSession = useCallback((values) => {
        let sessionStartDateTime = values.session_date;
        sessionStartDateTime = new Date(sessionStartDateTime).setHours(addZero(new Date(values.session_start_time).getHours()))
        sessionStartDateTime = new Date(sessionStartDateTime).setMinutes(addZero(new Date(values.session_start_time).getMinutes()))
        sessionStartDateTime = new Date(sessionStartDateTime).setSeconds(addZero(new Date(values.session_start_time).getSeconds()))
        sessionStartDateTime = new Date(sessionStartDateTime);

        let sessionEndDateTime = values.session_date;
        sessionEndDateTime = new Date(sessionEndDateTime).setHours(addZero(new Date(values.session_end_time).getHours()))
        sessionEndDateTime = new Date(sessionEndDateTime).setMinutes(addZero(new Date(values.session_end_time).getMinutes()))
        sessionEndDateTime = new Date(sessionEndDateTime).setSeconds(addZero(new Date(values.session_end_time).getSeconds()))
        sessionEndDateTime = new Date(sessionEndDateTime);

        let agendaDetails = {
            'name': values.sessionName.trim(),
            'date': values.session_date,
            'start_time': sessionStartDateTime,
            'end_time': sessionEndDateTime,
            'start_date_time': sessionStartDateTime,
            'end_date_time': sessionEndDateTime,
            'room': values.rooms.value,
            'private': values.privateRoom,
            'description': values.description,
            'floor_title': values.sessionfloorTitle,
            'event_id': eventID
        }
        setDisableBtn(true);

        if (agendaId !== undefined && agendaId !== null && agendaId !== "") {
            agendaDetails._id = agendaId;

            api.updateAgenda(agendaDetails).then((data) => {
                setDisableBtn(false);
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        Toast.fire({
                            icon: 'success',
                            title: "Session updated successfully"
                        })

                        setAgendaDetails(prevAgendaDetails => {
                            const index = prevAgendaDetails.findIndex(agendas => agendas._id === agendaId);
                            const agendas = [...prevAgendaDetails];
                            agendas[index] = data.data.result;
                            props.saveSessions(agendas);
                            return agendas;
                        });

                        setAgendaId("");
                        closeSessionModal();
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
            if (eventID !== "") {
                api.addAgenda(agendaDetails).then((data) => {
                    setDisableBtn(false);
                    if (data && data !== undefined && data !== null && data !== "") {
                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                            Toast.fire({
                                icon: 'success',
                                title: "Session Added Successfully"
                            })
                            setAgendaDetails(prevAgendaDetails => {
                                const newAgendaDetails = [...prevAgendaDetails, data.data.result];
                                props.saveSessions(newAgendaDetails);
                                return newAgendaDetails;
                            });
                            closeSessionModal();
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
                closeSessionModal();
            }
        }
    }, [eventID, agendaId, props, closeSessionModal, addZero]);

    const sessionForm = useCallback(({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        handleReset,
        setFieldValue,
    }) => {
        console.log(eventStartTime,"eventStartTime");
        return (
            <React.Fragment>
                <Form onSubmit={handleSubmit}>
                    <div className="">
                        <div className=" agenda-popup">
                            <div className="d-flex justify-content-end popup-close-btn" onClick={closeSessionModal}>&times;</div>
                            <div className="popup-content">
                                <div className="lang-header mt10">Add Session</div>
                                <div className="d-flex interpre-blk">
                                    <div className="agenda-wrapper mr15">
                                        <div className="room-name-label">Session Name<span className="star-imp">*</span></div>
                                        <Field type="text" maxLength="1500" name="sessionName" className="form-input modal-form-input" />
                                        <ErrorMessage name="sessionName" component="div" className="validtxt_msg" />
                                    </div>
                                    <div className="agenda-wrapper" style={{ 'marginTop': '0px' }}>
                                        <div className="room-name-label">Date<span className="star-imp">*</span></div>
                                        <DatePicker
                                            selected={values.session_date}
                                            onChange={(e) => {
                                                setFieldValue('session_date', e);
                                            }}
                                            onChangeRaw={(e) => { e.preventDefault() }}
                                            excludeOut
                                            className="form-input modal-form-input"
                                            timeIntervals={10}
                                            dateFormat="MMMM d, yyyy "
                                            timeCaption="time"
                                            placeholderText=""
                                            minDate={moment(eventDate).toDate()}
                                            maxDate={moment(eventDate).toDate()}
                                        />
                                        <ErrorMessage name="session_date" component="div" className="validtxt_msg" />
                                    </div>

                                </div>
                                <div className="d-flex interpre-blk">
                                    <div className="agenda-wrapper mr15">
                                        <div className="room-name-label">Start Time<span className="star-imp">*</span></div>
                                        <DatePicker
                                            selected={values.session_start_time}
                                            onChange={(e) => {
                                                setFieldValue('session_start_time', e);
                                            }}
                                            onChangeRaw={(e) => { e.preventDefault() }}
                                            className="form-input modal-form-input"
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                            placeholderText=""
                                            // minTime={setHours(setMinutes(new Date(), new Date(eventStartTime).getMinutes()), new Date(eventStartTime).getHours())}
                                            // maxTime={setHours(setMinutes(new Date(), new Date(eventEndTime).getMinutes()), new Date(eventEndTime).getHours())}
                                        />
                                        <ErrorMessage name="session_start_time" component="div" className="validtxt_msg" />
                                    </div>

                                    <div className="agenda-wrapper">
                                        <div className="room-name-label">End Time<span className="star-imp">*</span></div>
                                        <DatePicker
                                            selected={values.session_end_time}
                                            onChange={(e) => {
                                                setFieldValue('session_end_time', e);
                                            }}
                                            onChangeRaw={(e) => { e.preventDefault() }}
                                            className="form-input modal-form-input"
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                            placeholderText=""
                                            // minTime={setHours(setMinutes(new Date(), new Date(eventStartTime).getMinutes()), new Date(eventStartTime).getHours())}
                                            // maxTime={setHours(setMinutes(new Date(), new Date(eventEndTime).getMinutes()), new Date(eventEndTime).getHours())}
                                        />
                                        <ErrorMessage name="session_end_time" component="div" className="validtxt_msg" />
                                    </div>

                                </div>

                                <div className="d-flex interpre-blk">
                                    <div className="agenda-wrapper mr15">
                                        <div className="room-name-label">Room<span className="star-imp">*</span></div>
                                        <Select
                                            name="rooms"
                                            value={values.rooms}
                                            options={roomsRef.current}
                                            // className="custom-droplst custom-chev-down"
                                            onChange={e => setFieldValue('rooms', e)}
                                            onBlur={handleBlur}
                                            style={{ display: 'block' }}
                                        />
                                        <ErrorMessage name="rooms" component="div" className="validtxt_msg" />
                                    </div>


                                    <div className="agenda-wrapper">
                                         <div className="room-name-label">Floor Title<span className="star-imp">*</span></div>
                                        <Field type="text" maxLength="1500" name="sessionfloorTitle" className="form-input modal-form-input" />
                                        <ErrorMessage name="sessionfloorTitle" component="div" className="validtxt_msg" />
                                       
                                    </div>

                                </div>

                                <div className="d-flex interpre-blk">
                                    <div className="agenda-wrapper mr15">
                                    <div className="room-name-label">Description<span className="star-imp">*</span></div>
                                        <textarea
                                            className="form-input modal-form-input txt-area-desc" 
                                            type="text"
                                            name="description"
                                            onChange={e => setFieldValue('description', e.currentTarget.value)}
                                            maxLength="1500"
                                            value={values.description}
                                        ></textarea>
                                        <ErrorMessage name="description" component="div" className="validtxt_msg" />
                                    </div>
                                    <div className="agenda-wrapper">
                                        <div className="agenda-type" style={{ "marginTop": "40px" }}>
                                            <div className="mod-checkbox-wrapper">
                                                <label className="mod-custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        name="privateRoom"
                                                        value={values.privateRoom}
                                                        checked={values.privateRoom === true ? "checked": ""}
                                                        onChange={() => { setFieldValue('privateRoom', !values.privateRoom); }}
                                                    />
                                                    <span className="checkmark"></span>
                                                </label>
                                                <div className="mod-checkbox-label">Private</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center modal-btn-blk room-btn-blk">
                                    <button type="button" className="modal-cancel-btn" onClick={closeSessionModal}>Cancel</button>
                                    {
                                        agendaId !== undefined && agendaId !== null && agendaId !== ""
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
    }, [closeSessionModal, agendaId, disableBtn, eventDate, eventStartTime, eventEndTime]);

    const editAgenda = useCallback((val) => {
        let room = roomsRef.current.filter(room => (room.value === val.room)) !== undefined && roomsRef.current.filter(room => (room.value === val.room))[0] !== undefined && roomsRef.current.filter(room => (room.value === val.room))[0].label !== undefined ? roomsRef.current.filter(room => (room.value === val.room))[0] : '';

        initialValuesRef.current.sessionName = val.name;
        initialValuesRef.current.session_date = new Date(moment(val.start_date_time).format("YYYY-MM-DD HH:mm"));
        initialValuesRef.current.session_start_time = new Date(moment(val.start_time).format("YYYY-MM-DD HH:mm"));
        initialValuesRef.current.session_end_time = new Date(moment(val.end_time).format("YYYY-MM-DD HH:mm"));
        initialValuesRef.current.rooms = room;
        initialValuesRef.current.privateRoom = val.private;
        initialValuesRef.current.description = val.description;
        initialValuesRef.current.sessionfloorTitle = val.floor_title;

        setAgendaId(val._id);
        openSessionModal();
    }, [openSessionModal]);

    const deleteAgenda = useCallback((id, index) => {
        Swal.fire({
            title: 'Delete Session',
            text: "Are you sure you want to delete? This will delete the interpreters corresponding to this session",
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
                    api.deleteAgenda(id).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Session deleted successfully"
                                })
                                setAgendaDetails(prevAgendaDetails => {
                                    const newAgendaDetails = [...prevAgendaDetails];
                                    newAgendaDetails.splice(index, 1);
                                    props.saveSessions(newAgendaDetails);
                                    return newAgendaDetails;
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
    }, [props]);

    // Effect for componentDidMount
    useEffect(() => {
        splittedURLRef.current = props.location.pathname.split("/");
        if (splittedURLRef.current[2] !== "" && splittedURLRef.current[2] !== undefined) {
            eventIDRef.current = splittedURLRef.current[2];
            getSessionsByEventID();
        }
    }, [props.location.pathname]);

    // Effect for componentDidUpdate
    useEffect(() => {
        setEventDate(props.eventData.date);
        setEventStartTime(props.eventData.start_time);
        setEventEndTime(props.eventData.end_time);
        setStreamOut(props.eventData.streamOut);
        
        if (props.eventData._id !== undefined && props.activeTab === '5' && eventID !== props.eventData._id) {
            setEventID(props.eventData._id);
        } else if (props.eventData._id === undefined && props.activeTab === '5') {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
            props.stepToLanguage();
        }
    }, [props.eventData, props.activeTab, eventID, props]);

    // Effect for rooms update
    useEffect(() => {
        if (props.rooms !== undefined && props.rooms.length > 0) {
            roomsRef.current = props.rooms;
            updateSessionDetails();
        }
    }, [props.rooms, updateSessionDetails]);

    return (
        <React.Fragment>

            <div className="agenda-blk">

                <div className="add-room-wrapper">
                    <div className="d-flex align-items-center add-room-txt" onClick={openSessionModal}><span className="add-room-plus">+</span>Add Session</div>
                </div>

                {agendaDetails.map((value, key) => {
                    let room = roomsRef.current.filter(room => (room.value === value.room)) !== undefined && roomsRef.current.filter(room => (room.value === value.room))[0] !== undefined  && roomsRef.current.filter(room => (room.value === value.room))[0].label !== undefined ? roomsRef.current.filter(room => (room.value === value.room))[0].label: '';

                    return (
                        <div className="session-block" key={"sessions_"+key}>
                            <div className="d-flex agenda-wraper">
                                <div className="agenda-container">
                                    <label className="formgrp-label">Session Name</label>
                                    <div className="form-input" placeholder="" title={value.name}> {value.name} </div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">Date</label>
                                    <div className="form-input" placeholder=""> {moment(value.start_date_time).format("MMMM DD, yyyy")} </div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">Start Time</label>
                                    <div className="form-input" placeholder="" >{moment(value.start_time).format("hh:mm A")} </div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">End Time</label>
                                    <div className="form-input" placeholder="" > {moment(value.end_time).format("hh:mm A")} </div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">Room</label>
                                    <div className="form-input" title={room}>{room}</div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">Description</label>
                                    <div className="form-input" placeholder="" title={value.description}> {value.description}</div>
                                </div>
                                <div className="agenda-container">
                                    <label className="formgrp-label">Floor Title</label>
                                    <div className="form-input" placeholder="" title={value.floor_title}> {value.floor_title} </div>
                                </div>
                                <div className="mobile-icon-single">
                                    <div className="d-flex aganta-type">
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={value.private} readOnly />
                                            <span className="checkmark"></span>
                                        </label>
                                        <div className="checkbox-label">Private</div>
                                    </div>
                                    
                                    {eventIDRef.current !== undefined && eventIDRef.current !== null && eventIDRef.current !== "" && (
                                        <div className="agenda-del-blk">
                                            <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => editAgenda(value)}><img src={editPencilIcon} alt="edit room" /></div>
                                        </div>
                                    )}
                                    <div className="agenda-del-blk">
                                            <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => deleteAgenda(value._id, key)}><img src={trashIcon} alt="deleteImg" /></div>
                                    </div>
                                </div>
                            </div>
                            {streamOut && (
                                <div className="rtmp-stream-info">
                                    <div className="stream-info-text info">
                                        <span className="stream-info-heading"><span>INFO</span><span>:</span></span>
                                        <div className="stream-info-desc">
                                            Download and install OBS software from <a className="rtmp-url-val" href="https://obsproject.com/download" target="_blank" rel="noopener noreferrer">https://obsproject.com/download</a> and put the following details on streaming tab to start the external streaming.
                                    </div>
                                    </div>
                                    <div className="stream-info-text">
                                        <div className="stream-info-heading"><span>RTMP URL</span><span>:</span></div><div className="rtmp-url-val">rtmp://wowza.rafikyconnect.net/rafky</div> </div>
                                    <div className="stream-info-text">
                                        <div className="stream-info-heading"><span>STREAM KEY</span><span>:</span></div> Floor_{value._id}
                                    </div>
                                    <div className="rtmp-note-txt"><span>NB :</span>If multiple languages are added, language key will be the stream key</div>
                                </div>
                            )}                                    
                        </div>
                    )
                })}
                
            </div>
            <div className="d-flex align-items-center btn-acn-blk">
                <button type="button" onClick={() => props.stepToLanguage()} className="prev-btn">Prev</button>
                <button type="button" disabled={agendaDetails.length > 0 ? false : true} onClick={() => props.stepToInterpreter()} className="next-btn">Next</button>
            </div>

            <Modal isOpen={isModalOpen} fade={true} centered className={'double-modal-dialog'}>
                <Formik
                    initialValues={initialValuesRef.current}
                    validationSchema={validationSchema}
                    onSubmit={submitSession}
                >
                    {sessionForm}
                </Formik>
            </Modal>
        </React.Fragment>
    );
}