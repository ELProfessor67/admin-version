import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ClipLoader from 'react-spinners/ClipLoader';

const RoomModal = ({ isOpen, toggle, handleSubmit, room, disableBtn }) => {
    const initialValues = {
        roomName: room ? room.name : '',
    };

    const validationSchema = Yup.object().shape({
        roomName: Yup.string().trim().required('Room Name is required'),
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{room ? 'Edit Room' : 'Add Room'}</ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form>
                        <ModalBody>
                            <div className="form-group">
                                <label>Room Name *</label>
                                <Field name="roomName" className="form-control" />
                                <ErrorMessage name="roomName" component="div" className="text-danger" />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button type="button" className="btn btn-secondary" onClick={toggle}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={disableBtn}>
                                {disableBtn ? <ClipLoader size={20} color={"#fff"} /> : (room ? 'Update' : 'Save')}
                            </button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default RoomModal; 