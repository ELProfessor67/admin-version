import React from 'react';
import { Formik, Form, Field } from 'formik';

const EventSettings = ({ settings, onSubmit, disableBtn }) => {
    return (
        <Formik
            initialValues={settings}
            onSubmit={onSubmit}
            enableReinitialize
        >
            {() => (
                <Form>
                    <h4>Event Settings</h4>
                    <div className="row">
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="streamOut" className="form-check-input" />
                            <label className="form-check-label">Stream Out</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="signLanguageMode" className="form-check-input" />
                            <label className="form-check-label">Sign Language Mode</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="recording" className="form-check-input" />
                            <label className="form-check-label">Recording</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="speakerUserList" className="form-check-input" />
                            <label className="form-check-label">Speaker User List</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="enableDownloadPpt" className="form-check-input" />
                            <label className="form-check-label">Enable Download PPT</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="enableHighResolution" className="form-check-input" />
                            <label className="form-check-label">Enable High Resolution</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="disablePublicCL" className="form-check-input" />
                            <label className="form-check-label">Disable Public Chat (Listener)</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="disablePublicCS" className="form-check-input" />
                            <label className="form-check-label">Disable Public Chat (Speaker)</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="disablePrivateCL" className="form-check-input" />
                            <label className="form-check-label">Disable Private Chat (Listener)</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="disablePrivateCS" className="form-check-input" />
                            <label className="form-check-label">Disable Private Chat (Speaker)</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="disableChat" className="form-check-input" />
                            <label className="form-check-label">Disable Chat</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="enablePopupNot" className="form-check-input" />
                            <label className="form-check-label">Enable Popup Notification</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="enableSecondaryModerator" className="form-check-input" />
                            <label className="form-check-label">Enable Secondary Moderator</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="enableMasterSpeaker" className="form-check-input" />
                            <label className="form-check-label">Enable Master Speaker</label>
                        </div>
                        <div className="col-md-4 form-group">
                            <Field type="checkbox" name="translationAI" className="form-check-input" />
                            <label className="form-check-label">Enable Translation AI</label>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={disableBtn}>Save Settings</button>
                </Form>
            )}
        </Formik>
    );
};

export default EventSettings; 