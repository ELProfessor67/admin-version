import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import ClipLoader from 'react-spinners/ClipLoader';

const AI_INTERPETER_EMAIL_DOMAIN = "ai.com";
const isAIInterpreter = (email = '') => email.includes(AI_INTERPETER_EMAIL_DOMAIN);

const InterpreterModal = ({ isOpen, toggle, handleSubmit, interpreter, languages, sessions, disableBtn }) => {
    
    const initialValues = {
        interpreterName: interpreter ? interpreter.name : "",
        emailId: interpreter ? interpreter.email : "",
        fromLanguage: interpreter ? languages.find(l => l.value === interpreter.from) : "",
        toLanguage: interpreter ? languages.find(l => l.value === interpreter.to) : "",
        session: interpreter ? interpreter.session.map(s => sessions.find(sess => sess.value === s)) : [],
        twoWayAllowed: interpreter ? interpreter.two_way : false,
        interpreterVideo: interpreter ? interpreter.video : false,
        translationAi: interpreter ? isAIInterpreter(interpreter.email) : false,
    };

    const validationSchema = Yup.object().shape({
        interpreterName: Yup.string().trim().when("translationAi", {
            is: false,
            then: (schema) => schema.required("Name is required"),
        }),
        emailId: Yup.string().trim().email("Email is invalid").when("translationAi", {
            is: false,
            then: (schema) => schema.required("Email is required"),
        }),
        fromLanguage: Yup.object().required('From is required!'),
        toLanguage: Yup.object().required('To is required!'),
        session: Yup.array().min(1, 'Session is required!')
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>{interpreter ? 'Edit Interpreter' : 'Add Interpreter'}</ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ setFieldValue, values, errors }) => (
                    <Form>
                        <ModalBody>
                            <div className="row">
                                {!values.translationAi &&
                                <>
                                    <div className="col-md-6 form-group">
                                        <label>Interpreter Name *</label>
                                        <Field name="interpreterName" className="form-control" />
                                        <ErrorMessage name="interpreterName" component="div" className="text-danger" />
                                    </div>
                                    <div className="col-md-6 form-group">
                                        <label>Email *</label>
                                        <Field name="emailId" type="email" className="form-control" />
                                        <ErrorMessage name="emailId" component="div" className="text-danger" />
                                    </div>
                                </>
                                }
                                <div className="col-md-6 form-group">
                                    <label>From Language *</label>
                                    <Select options={languages} value={values.fromLanguage} onChange={option => setFieldValue('fromLanguage', option)} />
                                    <ErrorMessage name="fromLanguage" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-6 form-group">
                                    <label>To Language *</label>
                                    <Select options={languages} value={values.toLanguage} onChange={option => setFieldValue('toLanguage', option)} />
                                    <ErrorMessage name="toLanguage" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-12 form-group">
                                    <label>Session *</label>
                                    <Select isMulti options={sessions} value={values.session} onChange={option => setFieldValue('session', option)} />
                                    <ErrorMessage name="session" component="div" className="text-danger" />
                                </div>
                                <div className="col-md-4">
                                    <Field type="checkbox" name="twoWayAllowed" className="form-check-input" />
                                    <label className="form-check-label">Two-way</label>
                                </div>
                                <div className="col-md-4">
                                    <Field type="checkbox" name="interpreterVideo" className="form-check-input" />
                                    <label className="form-check-label">Video</label>
                                </div>
                                <div className="col-md-4">
                                    <Field type="checkbox" name="translationAi" className="form-check-input" />
                                    <label className="form-check-label">AI</label>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <button type="button" className="btn btn-secondary" onClick={toggle}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={disableBtn}>
                                {disableBtn ? <ClipLoader size={20} color={"#fff"} /> : (interpreter ? 'Update' : 'Save')}
                            </button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default InterpreterModal; 