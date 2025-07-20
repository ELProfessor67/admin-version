import React from 'react';
import { Modal } from 'reactstrap';
import Information from '@/assets/img/information.svg';
import CopyUrl from '@/assets/img/copy-url.svg';

const EventInfoModal = ({ isOpen, toggle, eventInfo, onCopyLink }) => {
    if (!eventInfo) {
        return null;
    }

    const {
        name,
        description,
        event_code,
        enableSecondaryModerator,
        streamOut,
        signLanguageMode,
    } = eventInfo;

    const links = [
        { label: 'Moderator', url: process.env.REACT_APP_MEETING_LINK_MODERATOR + event_code },
        { label: 'Secondary Moderator', url: process.env.REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + event_code, condition: enableSecondaryModerator === true },
        { label: 'Speaker', url: process.env.REACT_APP_MEETING_LINK_SPEAKER + event_code },
        { label: 'Interpreter', url: process.env.REACT_APP_MEETING_LINK_INTERPRETER + event_code },
        { label: 'Viewer', url: process.env.REACT_APP_MEETING_LINK_LEARNER + event_code },
        { label: 'Stream Out', url: process.env.REACT_APP_MEETING_LINK_STREAMOUT + event_code, condition: streamOut === true },
        { label: 'Sign Language Mode', url: process.env.REACT_APP_MEETING_LINK_SIGNLANGUAGE + event_code, condition: signLanguageMode === true },
    ];

    return (
        <Modal isOpen={isOpen} fade={true} centered className={'info-modal-dialog'}>
            <div className="d-flex justify-content-end popup-close-btn" onClick={toggle}>
                &times;
            </div>
            <div className="popup-info-icon-wrapper">
                <img src={Information} alt="info" />
            </div>
            <div className="popup-info-desc">
                <div className="meet-schedul-caption meet-schedul-underline">{name}</div>
                <div className="meeting-listing-whole-blk">
                    {description && (
                        <div className="meeting-lst-desc-wrap">
                            <div className="rooms-lst-label">Description</div>
                            <div className="meeting-event-desc">{description}</div>
                        </div>
                    )}

                    {links.map(link => (
                        (link.condition === undefined || link.condition) && (
                            <div className="meeting-link-desc" key={link.label}>
                                <div className="d-flex event-meet-link moderator-lk">{link.label} :</div>
                                <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                    <div className="meeting-link-url" title={link.url}>{link.url}</div>
                                    <div className="meet-link-url-copy" onClick={() => onCopyLink(link.url)}>
                                        <img src={CopyUrl} alt="copy url" />
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default EventInfoModal; 