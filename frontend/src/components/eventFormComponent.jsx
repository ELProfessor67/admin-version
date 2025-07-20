import React from 'react';
import { Field, Form, ErrorMessage } from 'formik';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ClipLoader from "react-spinners/ClipLoader";
import ImageUpload from '@/components/imageUploadComponent';

const EventForm = ({ 
    values, 
    setFieldValue, 
    disableBtn, 
    eventID,
    logoImageURL,
    handleImageChange,
    handleImageRemove,
    setLogoImage,
    setLogoImageURL,

    coverImageURLs,
    handleCoverImageChange,
    handleCoverImageRemove,

    lobbyResourceURL,
    setLobbyResource,
    setLobbyResourceURL,

    loginPageBgUrl,
    setLoginPageBg,
    setLoginPageBgUrl,

    landingPageBgUrl,
    setLandingPageBg,
    setLandingPageBgUrl,

    conferencePageBgUrl,
    setConferencePageBg,
    setConferencePageBgUrl
}) => {
    return (
        <Form>
            <div className="row">
                <div className="col-md-6 form-group">
                    <label>Event Name *</label>
                    <Field name="eventName" className="form-control" placeholder="Event Name" />
                    <ErrorMessage name="eventName" component="div" className="text-danger" />
                </div>
                <div className="col-md-6 form-group">
                    <label>Event Address *</label>
                    <Field name="eventAddress" className="form-control" placeholder="Event Address" />
                    <ErrorMessage name="eventAddress" component="div" className="text-danger" />
                </div>
                <div className="col-md-4 form-group">
                    <label>Date *</label>
                    <DatePicker
                        selected={values.event_date}
                        onChange={(e) => setFieldValue('event_date', e)}
                        className="form-control"
                        placeholderText="Select date"
                        minDate={new Date()}
                    />
                    <ErrorMessage name="event_date" component="div" className="text-danger" />
                </div>
                <div className="col-md-4 form-group">
                    <label>Start Time *</label>
                    <DatePicker
                        selected={values.event_start_time}
                        onChange={(e) => setFieldValue('event_start_time', e)}
                        className="form-control"
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Select start time"
                    />
                    <ErrorMessage name="event_start_time" component="div" className="text-danger" />
                </div>
                <div className="col-md-4 form-group">
                    <label>End Time *</label>
                    <DatePicker
                        selected={values.event_end_time}
                        onChange={(e) => setFieldValue('event_end_time', e)}
                        className="form-control"
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Select end time"
                    />
                    <ErrorMessage name="event_end_time" component="div" className="text-danger" />
                </div>
                <div className="col-md-12 form-group">
                    <label>Description</label>
                    <Field as="textarea" name="description" className="form-control" />
                </div>

                <div className="col-md-12">
                     <div className="form-check">
                        <Field type="checkbox" name="testEvent" className="form-check-input" />
                        <label className="form-check-label">Test Event</label>
                    </div>
                    <div className="form-check">
                        <Field type="checkbox" name="repeatWeekly" className="form-check-input" />
                        <label className="form-check-label">Repeat Weekly</label>
                    </div>
                    <div className="form-check">
                        <Field type="checkbox" name="useDefault" className="form-check-input" />
                        <label className="form-check-label">Use Rafiky Main Logo</label>
                    </div>
                    <div className="form-check">
                        <Field type="checkbox" name="useBgDefault" className="form-check-input" />
                        <label className="form-check-label">Use Rafiky Default Backgrounds</label>
                    </div>
                </div>
            </div>

            <hr />

            <div className="row">
                <div className="col-md-4">
                    <ImageUpload
                        title="Logo Image"
                        imageUrl={logoImageURL}
                        onImageChange={handleImageChange(setLogoImage, setLogoImageURL)}
                        onImageRemove={handleImageRemove(setLogoImage, setLogoImageURL)}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <ImageUpload
                        title="Lobby Background"
                        imageUrl={lobbyResourceURL}
                        onImageChange={handleImageChange(setLobbyResource, setLobbyResourceURL)}
                        onImageRemove={handleImageRemove(setLobbyResource, setLobbyResourceURL)}
                    />
                </div>
                <div className="col-md-4">
                    <ImageUpload
                        title="Login Page Image"
                        imageUrl={loginPageBgUrl}
                        onImageChange={handleImageChange(setLoginPageBg, setLoginPageBgUrl)}
                        onImageRemove={handleImageRemove(setLoginPageBg, setLoginPageBgUrl)}
                    />
                </div>
                <div className="col-md-4">
                    <ImageUpload
                        title="Landing Page Image"
                        imageUrl={landingPageBgUrl}
                        onImageChange={handleImageChange(setLandingPageBg, setLandingPageBgUrl)}
                        onImageRemove={handleImageRemove(setLandingPageBg, setLandingPageBgUrl)}
                    />
                </div>
                <div className="col-md-4">
                    <ImageUpload
                        title="Conference Page Image"
                        imageUrl={conferencePageBgUrl}
                        onImageChange={handleImageChange(setConferencePageBg, setConferencePageBgUrl)}
                        onImageRemove={handleImageRemove(setConferencePageBg, setConferencePageBgUrl)}
                    />
                </div>
            </div>

            <hr/>
            <h5>Sponsor Logos</h5>
            <div className="row">
                {[...Array(5)].map((_, index) => (
                    <div className="col-md-3" key={index}>
                        <ImageUpload
                            title={`Sponsor Logo ${index + 1}`}
                            imageUrl={coverImageURLs[index]}
                            onImageChange={(e) => handleCoverImageChange(e, index)}
                            onImageRemove={() => handleCoverImageRemove(index)}
                        />
                    </div>
                ))}
            </div>


            <button type="submit" className="btn btn-primary" disabled={disableBtn}>
                {disableBtn ? <ClipLoader size={20} color={"#fff"} /> : (eventID ? 'Update & Next' : 'Save & Next')}
            </button>
        </Form>
    );
};

export default EventForm; 