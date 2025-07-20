import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import ClipLoader from 'react-spinners/ClipLoader';

const LanguageModal = ({ isOpen, toggle, handleSubmit, language, languages, disableBtn, validationMsg }) => {

    const initialValues = {
        language: language ? languages.find(l => l.value === language.language_id) : '',
        languageTitle: language ? language.title : '',
    };

    const validationSchema = Yup.object().shape({
        language: Yup.object().required('Language is required'),
        languageTitle: Yup.string().trim().required('Language Title is required'),
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>{language ? 'Edit Language' : 'Add Language'}</ModalHeader>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ setFieldValue, values }) => (
                    <Form>
                        <ModalBody>
                            <div className="form-group">
                                <label>Language *</label>
                                <Select
                                    options={languages}
                                    value={values.language}
                                    onChange={(option) => setFieldValue('language', option)}
                                />
                                <ErrorMessage name="language" component="div" className="text-danger" />
                            </div>
                            <div className="form-group">
                                <label>Language Title *</label>
                                <Field name="languageTitle" className="form-control" />
                                <ErrorMessage name="languageTitle" component="div" className="text-danger" />
                            </div>
                            {validationMsg && <p className="text-danger">{validationMsg}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <button type="button" className="btn btn-secondary" onClick={toggle}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={disableBtn}>
                                {disableBtn ? <ClipLoader size={20} color={"#fff"} /> : (language ? 'Update' : 'Save')}
                            </button>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default LanguageModal; 