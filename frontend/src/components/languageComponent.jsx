import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/service/language/languageService";
import Swal from "sweetalert2";
import { Toast } from "@/components/toastComponent";
import pencilIcon from "@/assets/img/edit-pencil.svg";
import trashIcon from "@/assets/img/trash.svg";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Modal } from "reactstrap";
import Select from "react-select";
import ClipLoader from "react-spinners/ClipLoader";

const validationSchema = Yup.object().shape({
  language: Yup.string().trim().required("Language is required"),
  languageTitle: Yup.string().trim().required("Language Title is required"),
});

const defaultInitialValues = { language: "", languageTitle: "" };

export default function Language(props) {
  /* ------------------ state ------------------ */
  const [languageDetails, setLanguageDetails] = useState([]);
  const [languages, setLanguages]       = useState([]);
  const [eventID, setEventID]           = useState("");
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [disableBtn, setDisableBtn]     = useState(false);
  const [languageId, setLanguageId]     = useState("");
  const [languageValueId, setLanguageValueId] = useState("");
  const [languageValidationMsg, setLanguageValidationMsg] = useState("");
  const [formInitialValues, setFormInitialValues] = useState(defaultInitialValues);

  /* ------------------ derive event ID from URL on mount ------------------ */
  useEffect(() => {
    const urlSeg = props.location.pathname.split("/");
    if (urlSeg[2]) setEventID(urlSeg[2]);
  }, [props.location.pathname]);

  /* ------------------ sync languages prop → state ------------------ */
  useEffect(() => {
    setLanguages(props.languages);
  }, [props.languages]);

  /* ------------------ handle eventData / tab changes ------------------ */
  useEffect(() => {
    if (props.activeTab === "4") {
      if (props.eventData._id) {
        if (props.eventData._id !== eventID) setEventID(props.eventData._id);
      } else {
        Toast.fire({
          icon: "warning",
          title: "Something went wrong. Please try again!",
        });
        props.stepToRoom();
      }
    }
  }, [props.activeTab, props.eventData._id, eventID, props]);

  /* ------------------ fetch languages when eventID becomes available ------------------ */
  const getLanguages = useCallback(() => {
    if (!eventID) return;

    api
      .getLanguagesByEventID({ event_id: eventID })
      .then((res) => {
        if (res?.status === 200 && res.data?.data) {
          setLanguageDetails(res.data.data);
          props.saveLanguageForInterpreter(res.data.data);
        }
      })
      .catch(() =>
        Toast.fire({ icon: "warning", title: "Could not load languages" })
      );
  }, [eventID, props]);

  useEffect(() => {
    getLanguages();
  }, [eventID]);

  /* ------------------ helpers ------------------ */
  const openModal = () => {
    setFormInitialValues(defaultInitialValues);
    setLanguageId("");
    setLanguageValueId("");
    setLanguageValidationMsg("");
    setDisableBtn(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLanguageId("");
    setLanguageValueId("");
    setLanguageValidationMsg("");
    setDisableBtn(false);
  };

  /* -------- language form submit -------- */
  const submitLanguage = async (values, { resetForm }) => {
    const trimmedTitle = values.languageTitle.trim();
    const langId = values.language?.value;

    const duplicateTitle = languageDetails.filter(
      (l) =>
        l.title === trimmedTitle &&
        (languageId ? l.language_id !== languageValueId : true)
    );
    const duplicateLang = languageDetails.filter(
      (l) =>
        l.language_id === langId &&
        (languageId ? l.language_id !== languageValueId : true)
    );

    if (duplicateTitle.length || duplicateLang.length) {
      setLanguageValidationMsg(
        duplicateTitle.length && duplicateLang.length
          ? "Already existing language and title"
          : duplicateTitle.length
          ? "Already existing title"
          : "Already existing language"
      );
      return;
    }

    setDisableBtn(true);
    const payload = {
      title: trimmedTitle,
      language_id: langId,
      event_id: eventID,
      ...(languageId && { _id: languageId }),
    };

    try {
      const res = languageId
        ? await api.updateLanguage(payload)
        : await api.addLanguage(payload);

      if (res.status === 200 && res.data?.status) {
        Toast.fire({
          icon: "success",
          title: languageId ? "Language updated successfully" : "Language added successfully",
        });

        if (languageId) {
          setLanguageDetails((prev) =>
            prev.map((l) => (l._id === languageId ? res.data.result : l))
          );
        } else {
          setLanguageDetails((prev) => [...prev, res.data.result]);
        }
        props.saveLanguageForInterpreter(
          languageId ? languageDetails : [...languageDetails, res.data.result]
        );
        resetForm();
        closeModal();
      } else {
        throw new Error();
      }
    } catch {
      Toast.fire({ icon: "warning", title: "Something went wrong. Please try again!" });
    } finally {
      setDisableBtn(false);
    }
  };

  /* -------- edit / delete actions -------- */
  const editLanguage = (item) => {
    const langObj = languages.find((l) => l.value === item.language_id) || "";
    setFormInitialValues({ language: langObj, languageTitle: item.title });
    setLanguageId(item._id);
    setLanguageValueId(item.language_id);
    setIsModalOpen(true);
  };

  const deleteLanguage = (id, index) => {
    Swal.fire({
      title: "Delete Language",
      text: "Are you sure you want to delete? This will delete the interpreters who are assigned to this language",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#00d2a5",
      focusCancel: true,
    }).then(async (result) => {
      if (!result.value) return;

      try {
        const res = await api.deleteLanguage(id);
        if (res.status === 200) {
          Toast.fire({ icon: "success", title: "Language deleted successfully" });
          setLanguageDetails((prev) => prev.filter((_, i) => i !== index));
          props.saveLanguageForInterpreter(
            languageDetails.filter((_, i) => i !== index)
          );
        } else {
          throw new Error();
        }
      } catch {
        Toast.fire({ icon: "warning", title: "Something went wrong. Please try again!" });
      }
    });
  };

  /* -------- proceed buttons -------- */
  const checkLanguageValidation = () => {
    if (languageDetails.length >= 2 || languageDetails.length === 0) {
      props.stepToAgenda();
    } else {
      Toast.fire({ icon: "warning", title: "Please add minimum two language" });
    }
  };

  /* -------- memo derived data -------- */
  const renderedLanguageRows = useMemo(
    () =>
      languageDetails.map((lng, idx) => {
        const label = languages.find((l) => l.value === (lng.language_id?._id || lng.language_id))?.label || "";
        return (
          <div className="d-flex lang-row" key={idx}>
            <div className="lang-col-wrapper">
              <div className="lang-container">
                <label className="formgrp-label">
                  Language<span>*</span>
                </label>
                <div className="form-input lang-title">{label}</div>
              </div>
              <div className="lang-container">
                <label className="formgrp-label">
                  Title<span>*</span>
                </label>
                <div className="form-input lang-title">{lng.title}</div>
              </div>
              <div className="agenda-del-blk">
                <div
                  className="d-flex align-items-center justify-content-center room-del-btn"
                  onClick={() => editLanguage(lng)}
                >
                  <img src={pencilIcon} alt="edit language" />
                </div>
              </div>
              <div className="agenda-del-blk">
                <div
                  className="d-flex align-items-center justify-content-center room-del-btn"
                  onClick={() => deleteLanguage(lng._id, idx)}
                >
                  <img src={trashIcon} alt="delete language" />
                </div>
              </div>
            </div>
          </div>
        );
      }),
    [languageDetails, languages]
  );

  /* -------- form JSX (Formik render prop) -------- */
  const LanguageForm = ({ values, handleBlur, handleChange, setFieldValue }) => (
    <Form className="form-signin">
      <div className="d-flex justify-content-end popup-close-btn" onClick={closeModal}>
        &times;
      </div>
      <div className="lang-header mt10">
        {languageId ? "Edit Language" : "Add Language"}
      </div>

      <div className="lang-blk">
        <div className="lang-wraper">
          <div className="room-name-label">
            Language<span className="star-imp">*</span>
          </div>
          <Select
            name="language"
            value={values.language}
            options={languages}
            noOptionsMessage={() => "No Languages found"}
            onChange={(e) => {
              setFieldValue("language", e);
              setFieldValue("languageTitle", e.label);
              document.getElementById("languageTitle")?.focus();
            }}
            onBlur={handleBlur}
          />
          <ErrorMessage name="language" component="div" className="validtxt_msg" />
        </div>

        <div className="lang-wraper">
          <div className="room-name-label">
            Title<span className="star-imp">*</span>
          </div>
          <Field
            id="languageTitle"
            name="languageTitle"
            type="text"
            maxLength="100"
            className="form-input modal-form-input"
            onBlur={handleBlur}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <ErrorMessage name="languageTitle" component="div" className="validtxt_msg" />

        {languageValidationMsg && (
          <div className="validtxt_msg">{languageValidationMsg}</div>
        )}
      </div>

      <div className="d-flex justify-content-center modal-btn-blk room-btn-blk">
        <button type="button" className="modal-cancel-btn" onClick={closeModal}>
          Cancel
        </button>
        <button type="submit" className="modal-save-btn" disabled={disableBtn}>
          {disableBtn
            ? languageId
              ? "Updating..."
              : "Saving..."
            : languageId
            ? "Update"
            : "Save"}
          {disableBtn && <ClipLoader size={15} color="#fff" loading />}
        </button>
      </div>
    </Form>
  );

  /* ------------------ render ------------------ */
  return (
    <>
      <div className="lang-schedule-blk">
        <div className="add-room-wrapper" onClick={openModal}>
          <div className="d-flex align-items-center add-room-txt">
            <span className="add-room-plus">+</span>Add Language
          </div>
        </div>

        {renderedLanguageRows}
      </div>

      <div className="d-flex align-items-center btn-acn-blk">
        <button type="button" onClick={props.stepToRoom} className="prev-btn">
          Prev
        </button>
        <button type="button" onClick={checkLanguageValidation} className="next-btn">
          Next
        </button>
      </div>

      <Modal isOpen={isModalOpen} centered className="single-modal-content">
        <Formik
          enableReinitialize
          initialValues={formInitialValues}
          validationSchema={validationSchema}
          onSubmit={submitLanguage}
        >
          {(formikProps) => <LanguageForm {...formikProps} />}
        </Formik>
      </Modal>
    </>
  );
}
