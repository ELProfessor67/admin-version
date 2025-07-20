import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "@/service/room/roomService";
import Swal from 'sweetalert2';
import ClipLoader from "react-spinners/ClipLoader";
import { Toast } from "@/components/toastComponent";
import pencilIcon from "@/assets/img/edit-pencil.svg";
import trashIcon from "@/assets/img/trash.svg";

export default function Room(props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomDetails, setRoomDetails] = useState([]);
    const [eventID, setEventID] = useState('');
    const [disableBtn, setDisableBtn] = useState(false);
    const [roomId, setRoomId] = useState('');
    
    const eventIDRef = useRef("");
    const initialValuesRef = useRef({ roomName: "" });

    const validationSchema = Yup.object().shape({
        roomName: Yup.string().trim().required("Room Name is required")
    });

    const getRoomsByEventID = useCallback(() => {
        let params = {
            event_id: eventIDRef.current
        }
        api.getRoomsByEventID(params).then((data) => {
            if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                if (data.data.data !== "" && data.data.data !== undefined) {
                    setRoomDetails(data.data.data);
                    props.saveRooms(data.data.data);
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

    const openRoomModal = useCallback(() => {
        if (eventID !== "") {
            setIsModalOpen(true);
        } else {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
        }
    }, [eventID]);

    const closeRoomModal = useCallback(() => {
        initialValuesRef.current.roomName = "";
        setRoomId("");
        setIsModalOpen(false);
    }, []);

    const submitRoom = useCallback(async (values, { resetForm }) => {
        let roomDetails = {
            'name': values.roomName.trim(),
            'event_id': eventID
        }

        if (roomId !== undefined && roomId !== null && roomId !== "") {
            roomDetails._id = roomId;
            setDisableBtn(true);

            api.updateRoom(roomDetails).then((data) => {
                setDisableBtn(false);

                try {
                    if (data && data !== undefined && data !== null && data !== "") {
                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                            Toast.fire({
                                icon: 'success',
                                title: "Room updated successfully"
                            })

                            setRoomDetails(prevRoomDetails => {
                                const index = prevRoomDetails.findIndex(rooms => rooms._id === roomId);
                                const rooms = [...prevRoomDetails];
                                rooms[index] = data.data.result;
                                props.saveRooms(rooms);
                                return rooms;
                            });

                            setRoomId("");
                            resetForm({});
                            closeRoomModal();

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
                } catch(e) {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    })
                }
            });

        } else {
            if (eventID !== "") {
                setDisableBtn(true);

                api.addRoom(roomDetails).then((data) => {
                    setDisableBtn(false);
                    if (data && data !== undefined && data !== null && data !== "") {
                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {                        
                            Toast.fire({
                                icon: 'success',
                                title: "Room added successfully"
                            })
                            setRoomDetails(prevRoomDetails => {
                                const newRoomDetails = [...prevRoomDetails, data.data.result];
                                props.saveRooms(newRoomDetails);
                                return newRoomDetails;
                            });

                            resetForm({});
                            closeRoomModal();

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
                closeRoomModal();
            }
        }
    }, [eventID, roomId, props, closeRoomModal]);

    const editRoom = useCallback((val) => {
        initialValuesRef.current.roomName = val.name;
        setRoomId(val._id);
        openRoomModal();
    }, [openRoomModal]);

    const deleteRoom = useCallback((id, index) => {
        Swal.fire({
            title: 'Delete Room',
            text: "Are you sure you want to delete? This will delete the session corresponding to this room and interpreters corresponding to the session",
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
                    api.deleteRoom(id).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Room deleted successfully"
                                })
                                setRoomDetails(prevRoomDetails => {
                                    const newRoomDetails = [...prevRoomDetails];
                                    newRoomDetails.splice(index, 1);
                                    props.saveRooms(newRoomDetails);
                                    return newRoomDetails;
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

    const setroomName = useCallback((e) => {
        console.log(e)
    }, []);

    const roomForm = useCallback(({
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
        return (
            <React.Fragment>
                <Form className="form-signin" onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-end popup-close-btn" onClick={(e) => {closeRoomModal(); handleReset(e);}}>&times;</div>
                    <div className="room-add-wrapper">
                        <span className="room-name-label">Enter Room Name</span>
                        <Field type="text" maxLength="100" name="roomName" id="roomName" className="form-input modal-form-input" />
                        <ErrorMessage name="roomName" component="div" className="validtxt_msg" />
                    </div>
                    <div className="d-flex justify-content-center modal-btn-blk room-btn-blk add-room-popup-btn">
                        <button type="button" className="modal-cancel-btn" onClick={(e) => { closeRoomModal(); handleReset(e); }}>Cancel</button>
                        {
                            roomId !== undefined && roomId !== null && roomId !== ""
                            ?
                            <button type="submit" className="modal-save-btn" disabled={disableBtn}>
                                {disableBtn === true ? 'Updating...' : 'Update'}
                                {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                            </button>
                            :
                            <button type="submit" className="modal-save-btn" disabled={disableBtn}>
                                {disableBtn === true ? 'Saving...' : 'Save'}
                                {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                            </button>
                        }                        
                    </div>
                </Form>
            </React.Fragment>
        )
    }, [closeRoomModal, roomId, disableBtn]);

    // Effect for componentDidMount
    useEffect(() => {
        const splittedURL = props.location.pathname.split("/");
        if (splittedURL[2] !== "" && splittedURL[2] !== undefined) {
            eventIDRef.current = splittedURL[2];
            getRoomsByEventID();
        }
    }, [props.location.pathname]);

    // Effect for componentDidUpdate
    useEffect(() => {
        if (props.eventData._id !== undefined && props.activeTab === '3' && eventID !== props.eventData._id) {
            setEventID(props.eventData._id);
        } else if (props.eventData._id === undefined && props.activeTab === '3') {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
            props.stepToEventFile();
        }
    }, [props.eventData._id, props.activeTab, eventID, props]);

    return (
        <React.Fragment>
            <div className="room-schedl-blk">

                <div className="add-room-blk">
                    <div className="add-room-wrapper" onClick={openRoomModal}>
                        <div className="d-flex align-items-center add-room-txt" ><span className="add-room-plus">+</span>Add Room</div>
                    </div>
                </div>
                
                <div className="room-schedul-wrapper">
                    {roomDetails.map((value, key) => {
                        return (
                            <div className="d-flex room-schedl-container" key={key}>
                                <div className="formgrp-txt-wrapper room-name-wrap">
                                    <div className="form-input">{value.name}</div>
                                </div>
                                {eventIDRef.current !== undefined && eventIDRef.current !== null && eventIDRef.current !== "" && (
                                    <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => editRoom(value)}><img src={pencilIcon} alt="edit room" /></div>
                                )}
                                <div className="d-flex align-items-center justify-content-center room-del-btn" onClick={() => deleteRoom(value._id, key)}><img src={trashIcon} alt="deleteImg" /></div>
                            </div>
                        )
                    })}
                </div>
                
            </div>
            <div className="d-flex align-items-center btn-acn-blk">
                <button type="button" onClick={() => props.stepToEventFile()} className="prev-btn">Prev</button>
                <button type="button" disabled={roomDetails.length > 0 ? false : true} onClick={() => props.stepToLanguage()} className="next-btn">Next</button>
            </div>


            <Modal isOpen={isModalOpen} fade={true} centered className={'single-modal-content'}>
                <Formik
                    initialValues={initialValuesRef.current}
                    validationSchema={validationSchema}
                    onSubmit={submitRoom}
                >
                    {roomForm}
                </Formik>                    
            </Modal>
        </React.Fragment>
    );
}

