import React from 'react';
import moment from "moment";
import CopyUrl from '@/assets/img/copy-url.svg';

const ParticipantEventDetails = ({ eventData, moderator, onCopyLink }) => {
    if (!eventData || moderator) {
        return null;
    }

    const {
        name,
        event_start_time,
        event_end_time,
        description,
        event_code,
        enableSecondaryModerator,
        streamOut,
        signLanguageMode,
    } = eventData;

    const links = [
        { label: 'Moderator', url: process.env.REACT_APP_MEETING_LINK_MODERATOR + event_code },
        { label: 'Secondary Moderator', url: process.env.REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + event_code, condition: enableSecondaryModerator === true },
        { label: 'Speaker', url: process.env.REACT_APP_MEETING_LINK_SPEAKER + event_code },
        { label: 'Interpreter', url: process.env.REACT_APP_MEETING_LINK_INTERPRETER + event_code },
        { label: 'Viewer', url: process.env.REACT_APP_MEETING_LINK_LEARNER + event_code },
        { label: 'Stream Out', url: process.env.REACT_APP_MEETING_LINK_STREAMOUT + event_code, condition: streamOut === true },
        { label: 'Sign Language', url: process.env.REACT_APP_MEETING_LINK_SIGNLANGUAGE + event_code, condition: signLanguageMode === true },
    ];

    return (
        <div className="meet-schedule-col  mod-meet-lst-blk">
            <div className="meet-schedul-caption meet-schedul-underline">{name}</div>
            <div className="meeting-listing-whole-blk">
                <div className="meeting-lst-desc-wrap">
                    <div className="rooms-lst-label">Event Start Time</div>
                    <div className="meeting-event-desc">
                        {moment(event_start_time).format('Do MMM YYYY, hh:mm a')}
                    </div>
                </div>

                <div className="meeting-lst-desc-wrap">
                    <div className="rooms-lst-label">Event End Time</div>
                    <div className="meeting-event-desc">
                        {moment(event_end_time).format('Do MMM YYYY, hh:mm a')}
                    </div>
                </div>

                <div className="meeting-lst-desc-wrap">
                    <div className="rooms-lst-label">Description</div>
                    <div className="meeting-event-desc">{description}</div>
                </div>

                {moderator && links.filter(l => l.condition === undefined || l.condition).map(link => (
                    <div className="meeting-link-desc" key={link.label}>
                        <div className="d-flex event-meet-link moderator-lk">{link.label} :</div>
                        <div className="d-flex align-items-center meeting-link-url-blk">
                            <div className="meeting-link-url" title={link.url}>{link.url}</div>
                            <div className="meet-link-url-copy" onClick={() => onCopyLink(link.url)}>
                                <img src={CopyUrl} alt="copy url" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParticipantEventDetails; 