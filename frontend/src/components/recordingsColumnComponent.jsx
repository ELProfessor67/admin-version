import React from 'react';
import NoData from '@/assets/img/no-data.svg';

const RecordingsColumn = ({ showEventRecordings, archives }) => {
    if (!showEventRecordings) {
        return null;
    }

    return (
        <React.Fragment>
            <div className="rooms-list-name-caption">All Recordings</div>
            <div className="recordings-wrapper">
                {archives && archives.length > 0 ? (
                    archives.map((archive, index) => {
                        const downloadLink = `${process.env.REACT_APP_S3_UPLOADS_URL}${process.env.REACT_APP_OPENTOK_KEY}/${archive.id}/archive.zip`;
                        return (
                            <div className="d-flex align-items-center justify-content-between recordings-container" key={"recordings_" + index}>
                                <div className="recordings-filename">{archive.name}</div>
                                <a href={downloadLink} download target="_blank" rel="noopener noreferrer">
                                    <div className="record-download-btn">Download</div>
                                </a>
                            </div>
                        );
                    })
                ) : (
                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                        <div className="no-resourses-lst">
                            <img src={NoData} alt="no-data" />
                        </div>
                        <div className="empty-list-txt">No recordings available</div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

export default RecordingsColumn; 