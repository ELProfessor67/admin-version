import React, { useState } from 'react';
import Axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { ProgressBar } from 'react-bootstrap';

const FileUpload = ({ onUpload, acceptedTypes, maxFileSize, label, eventID }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!acceptedTypes.includes(file.type)) {
                setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
                return;
            }
            if (file.size > maxFileSize) {
                setError(`File size exceeds the limit of ${maxFileSize / 1024 / 1024}MB.`);
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setIsLoading(true);
        setProgress(0);
        
        const data = new FormData();
        data.append('event_file', selectedFile);

        try {
            const response = await Axios.post(`${process.env.REACT_APP_API_URL}/event/upload_file/${eventID}`, data, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });
            onUpload(response.data.result, selectedFile.name, selectedFile.type);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input type="file" onChange={handleFileChange} />
            <button className="btn btn-secondary ml-2" onClick={handleUpload} disabled={isLoading || !selectedFile}>
                {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Upload'}
            </button>
            {isLoading && <ProgressBar now={progress} label={`${progress}%`} />}
            {error && <div className="text-danger">{error}</div>}
        </div>
    );
};

export default FileUpload; 