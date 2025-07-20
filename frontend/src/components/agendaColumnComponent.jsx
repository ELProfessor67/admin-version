import React from 'react';
import Loader from 'react-loader-spinner';
import moment from "moment";
import ClipLoader from "react-spinners/ClipLoader";

const AgendaColumn = ({
    fetchSessions,
    showSessions,
    eventAgenda,
    eventCode,
    eventStatus,
    joiningMeeting,
    goForEvents,
    moderator
}) => {
    if (!showSessions) {
        return null;
    }

    if (fetchSessions) {
        return (
            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Sessions. Please wait...</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            {eventAgenda.length > 0 ? (
                <React.Fragment>
                    <div className="rooms-listing-caption">Sessions</div>
                    {eventAgenda.map((agendas, index) => (
                        <div className="agenda-block" key={index}>
                            <div className="rooms-list-name-caption">{agendas.name}</div>
                            <div className="rooms-lst-col-desc">
                                <div className="rooms-lst-label">Description</div>
                                <div className="rooms-lst-event-desc">{agendas.description}</div>
                            </div>
                            <div className="d-flex rooms-lst-col-desc">
                                <div className="room-assign-start-time">
                                    <div className="rooms-lst-label">Start Time</div>
                                    <div className="rooms-lst-val">{moment(agendas.session_start_time).format('Do MMM YYYY, hh:mm a')}</div>
                                </div>
                                <div className="room-assign-end-time">
                                    <div className="rooms-lst-label">End Time</div>
                                    <div className="rooms-lst-val">{moment(agendas.session_end_time).format('Do MMM YYYY, hh:mm a')}</div>
                                </div>
                            </div>
                            <div className="rooms-lst-col-desc">
                                <div className="room-meet-id">Meeting ID:<span>{eventCode}</span></div>
                            </div>
                            {eventStatus !== "" && eventStatus !== 2 && (
                                <div className="room-join-btn-wrapper">
                                    {agendas.type === "past" ? (
                                        <button type="button" className="view-room-meet-btn">This meeting already expired</button>
                                    ) : (
                                        <button type="button" className="view-room-meet-btn" disabled={joiningMeeting} onClick={() => goForEvents(agendas)}>
                                            {joiningMeeting ? (moderator ? 'Starting Meeting... ' : 'Joining Meeting... ') : (moderator ? 'Start Meeting' : 'Join Meeting')}
                                            {joiningMeeting && <ClipLoader size={15} color={"#fff"} loading={true} />}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </React.Fragment>
            ) : (
                <div className="d-flex align-items-center justify-content-center flex-column h-100">
                    <div className="no-resourses-lst">
                        <img src={require("../../img/no-data.svg")} alt="no-data" />
                    </div>
                    <div className="empty-list-txt">No agenda available</div>
                </div>
            )}
        </React.Fragment>
    );
};

export default AgendaColumn; 