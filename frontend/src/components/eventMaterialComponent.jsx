import React, { useState, useEffect, useCallback } from 'react';
import apiInterPreterService from '@/service/interpreter/interpreterService';
import Swal from 'sweetalert2';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ClipLoader from "react-spinners/ClipLoader";
import helper from '@/utils/helper';
import { REACT_APP_API_URL } from '@/constants/URLConstant';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

const EventMaterial = ({ eventID }) => {
    const [eventMaterials, setEventMaterials] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [materialDetails, setMaterialDetails] = useState([]);
    const [disableSaveMaterialBtn, setDisableSaveMaterialBtn] = useState(false);

    const getEventMaterialsByEventID = useCallback(async () => {
        if (!eventID) return;
        const { data } = await apiInterPreterService.getEventMaterialsByEventID({ event_id: eventID });
        if (data.status) {
            setEventMaterials(data.data);
        }
    }, [eventID]);

    useEffect(() => {
        getEventMaterialsByEventID();
    }, [getEventMaterialsByEventID]);

    const deleteMaterial = (id, index) => {
        Swal.fire({
            title: 'Delete Event Material',
            text: "Are you sure you want to delete?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: "Yes, Proceed",
        }).then(async (result) => {
            if (result.value) {
                const { data } = await apiInterPreterService.deleteMaterial(id);
                if(data.status){
                    Toast.fire({ icon: 'success', title: "Material deleted successfully" });
                    const newMaterials = [...eventMaterials];
                    newMaterials.splice(index, 1);
                    setEventMaterials(newMaterials);
                } else {
                    Toast.fire({ icon: 'error', title: data.message });
                }
            }
        });
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            Toast.fire({ icon: 'warning', title: "Please select a file." });
            return;
        }
        setDisableSaveMaterialBtn(true);
        const data = new FormData();
        data.append('file', selectedFile);
        data.append('event_id', eventID);

        const res = await apiInterPreterService.saveEventMaterial(data);
        if(res.data.status){
            Toast.fire({ icon: 'success', title: "File uploaded successfully." });
            getEventMaterialsByEventID();
            toggleAddModal();
        } else {
            Toast.fire({ icon: 'error', title: res.data.message });
        }
        setDisableSaveMaterialBtn(false);
    };

    const toggleAddModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
        setSelectedFile(null);
    }
    const toggleViewModal = (materials) => {
        setMaterialDetails(materials);
        setIsViewModalOpen(!isViewModalOpen);
    }

    return (
        <div>
            <h4>Event Materials</h4>
            <button className="btn btn-primary mb-2" onClick={toggleAddModal}>Add Material</button>
            <table className="table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {eventMaterials.map((material, index) => (
                        <tr key={material._id}>
                            <td>{helper.getLobbyResourceName(material.material)}</td>
                            <td>
                                <button className="btn btn-sm btn-info mr-2" onClick={() => toggleViewModal(material.material)}>View</button>
                                <button className="btn btn-sm btn-danger" onClick={() => deleteMaterial(material._id, index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal isOpen={isAddModalOpen} toggle={toggleAddModal}>
                <ModalHeader toggle={toggleAddModal}>Add Event Material</ModalHeader>
                <ModalBody>
                    <input type="file" onChange={handleFileChange} />
                </ModalBody>
                <ModalFooter>
                    <button className="btn btn-secondary" onClick={toggleAddModal}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleFileUpload} disabled={disableSaveMaterialBtn}>
                        {disableSaveMaterialBtn ? <ClipLoader size={20} color={"#fff"} /> : 'Upload'}
                    </button>
                </ModalFooter>
            </Modal>

            <Modal isOpen={isViewModalOpen} toggle={() => toggleViewModal(null)} size="lg">
                <ModalHeader toggle={() => toggleViewModal(null)}>View Material</ModalHeader>
                <ModalBody>
                    <iframe src={REACT_APP_API_URL+materialDetails} style={{width: '100%', height: '500px'}} title="event-material"/>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default EventMaterial; 