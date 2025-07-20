import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ClipLoader from 'react-spinners/ClipLoader';

const SessionModal = ({ isOpen, toggle, handleSubmit, session, rooms, event, disableBtn }) => {
    
    const initialValues = {
        sessionName: session ? session.name : '',
        session_date: session ? new Date(session.date) : (event ? new Date(event.date) : ''),
        session_start_time: session ? new Date(session.start_time) : '',
        session_end_time: session ? new Date(session.end_time) : '',
        rooms: session ? rooms.find(r => r.value === session.room) : '',
        privateRoom: session ? session.private : false,
        description: session ? session.description : '',
        sessionfloorTitle: session ? session.floor_title : ''
    };

    const validationSchema = Yup.object().shape({
        sessionName: Yup.string().trim().required("Session Name is required"),
        session_date: Yup.date().required('Start date is required'),
        session_start_time: Yup.date().required('Start Time is required'),
        session_end_time: Yup.date().required('End Time is required').min(Yup.ref('session_start_time'), 'End time must be greater than start time'),
        rooms: Yup.object().required('Room is required!'),
        sessionfloorTitle: Yup.string().trim().required('Floor title is required!'),
        description: Yup.string().trim().required('Description is required!')
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>{session ? 'Edit Session' : 'Add Session'}</ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ setFieldValue, values }) => (
                    <Form>
                        <ModalBody>
                            <div className="row">
                                <div className="col-md-6 form-group">
                                    <label>Session Name *</label>
                                    <Field name="sessionName" className="form-control" />
                                    <ErrorMessage name="sessionName" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Room *</label>
                                    <Select
                                        options={rooms}
                                        value={values.rooms}
                                        onChange={(option) => setFieldValue('rooms', option)}
                                    />
                                    <ErrorMessage name="rooms" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Date *</label>
                                    <DatePicker
                                        selected={values.session_date}
                                        onChange={(e) => setFieldValue('session_date', e)}
                                        className="form-control"
                                        minDate={new Date(event.date)}
                                    />
                                    <ErrorMessage name="session_date" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>Start Time *</label>
                                    <DatePicker
                                        selected={values.session_start_time}
                                        onChange={(e) => setFieldValue('session_start_time', e)}
                                        className="form-control"
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        dateFormat="h:mm aa"
                                    />
                                    <ErrorMessage name="session_start_time" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-4 form-group">
                                    <label>End Time *</label>
                                    <DatePicker
                                        selected={values.session_end_time}
                                        onChange={(e) => setFieldValue('session_end_time', e)}
                                        className="form-control"
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        dateFormat="h:mm aa"
                                    />
                                    <ErrorMessage name="session_end_time" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>Floor Title *</label>
                                    <Field name="sessionfloorTitle" className="form-control" />
                                    <ErrorMessage name="sessionfloorTitle" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-12 form-group">
                                    <label>Description *</label>
                                    <Field as="textarea" name="description" className="form-control" />
                                    <ErrorMessage name="description" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-12">
                                    <div className="form-check">
                                        <Field type="checkbox" name="privateRoom" className="form-check-input" />
                                        <label className="form-check-label">Private Session</label>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button type="button" className="btn btn-secondary" onClick={toggle}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={disableBtn}>
                                {disableBtn ? <ClipLoader size={20} color={"#fff"} /> : (session ? 'Update' : 'Save')}
                            </button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default SessionModal; 