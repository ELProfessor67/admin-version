import React, { useState } from 'react';
import readXlsxFile from 'read-excel-file';
import ClipLoader from "react-spinners/ClipLoader";

const ExcelUpload = ({ onFileUpload, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (selectedFile) {
            readXlsxFile(selectedFile).then((rows) => {
                const emails = rows.slice(1).map(row => row[0]);
                onFileUpload(emails);
            });
        }
    };

    return (
        <div className="form-group">
            <input type="file" onChange={handleFileChange} accept=".xls,.xlsx" />
            <button className="btn btn-secondary ml-2" onClick={handleUpload} disabled={isLoading}>
                {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Upload Excel'}
            </button>
        </div>
    );
};

export default ExcelUpload; 