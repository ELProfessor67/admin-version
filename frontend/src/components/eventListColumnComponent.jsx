import React from 'react';
import Loader from 'react-loader-spinner';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EventListColumn = ({
    eventData,
    fetchEvents,
    createMeeting,
    eventList,
    currentEvents,
    pastEvents,
    accordionPanel,
    handleAccordionChange,
    viewRooms,
    showMeetingInfo,
    editEvent,
    deleteEvent,
}) => {
    if (eventData !== "") {
        return null;
    }

    return (
        <div className="meet-schedule-col  mod-meet-lst-blk">
            <div className="meet-schedul-caption meet-schedul-underline">Meetings</div>
            <div className="meeting-whole-lst">
                <div className="create-meet-lst">
                    <button type="button" className="room-join-btn" onClick={createMeeting}><span className="room-join-plus">+</span>Create Meeting</button>
                </div>
                {fetchEvents ? (
                    <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                        <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                        <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Events. Please wait...</div>
                    </div>
                ) : (
                    <React.Fragment>
                        {eventList && eventList.length > 0
                            ? (
                                <div className="current-meet-blk">
                                    {currentEvents.length > 0 &&
                                        <Accordion defaultExpanded expanded={accordionPanel === 'panel1a'} onChange={handleAccordionChange('panel1a')}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" className="current-meetings">Current meetings</AccordionSummary>
                                            <AccordionDetails>
                                                <div className="meet-lst-wrapper">
                                                    {currentEvents.map((event, key) => (
                                                        <div className={"d-flex align-items-center justify-content-between meet-lst-container meeting_list meeting_" + event._id} key={key}>
                                                            <div className={"meeting-lst-title "} onClick={() => viewRooms(event._id, event.event_code, 1, event.repeatWeekly, true)} title={event.name}>{event.name}</div>
                                                            <div className="meeting-info-icon" onClick={() => showMeetingInfo(event)}>
                                                                <img src={require("../../img/info.svg")} alt="info" />
                                                            </div>
                                                            <div className="meeting-lst-edit-wrapper" onClick={() => editEvent(event._id)}>
                                                                <img src={require("../../img/edit-pencil.svg")} alt="edit" />
                                                            </div>
                                                            <div className="meeting-lst-delete-wrapper" onClick={() => deleteEvent(event._id, key, "current")}>
                                                                <img src={require("../../img/trash.svg")} alt="delete" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    }

                                    {pastEvents.length > 0 &&
                                        <Accordion expanded={accordionPanel === 'panel2a'} onChange={handleAccordionChange('panel2a')}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header" className="past-meetings">Past meetings</AccordionSummary>
                                            <AccordionDetails>
                                                <div className="meet-lst-wrapper">
                                                    {pastEvents.map((event, key) => {
                                                        const archives = (event.archives?.length > 0) ? event.archives : (event.archive?.length > 0) ? event.archive : [];
                                                        return (
                                                            <div className={"d-flex align-items-center justify-content-between meet-lst-container meeting_list meeting_" + event._id} key={key}>
                                                                <div className={"meeting-lst-title "} onClick={() => viewRooms(event._id, event.event_code, 0, event.repeatWeekly, true, archives)} title={event.name}>{event.name}</div>
                                                                <div className="meeting-info-icon" onClick={() => showMeetingInfo(event)}>
                                                                    <img src={require("../../img/info.svg")} alt="info" />
                                                                </div>
                                                                <div className="meeting-lst-edit-wrapper" onClick={() => editEvent(event._id)}>
                                                                    <img src={require("../../img/edit-pencil.svg")} alt="edit" />
                                                                </div>
                                                                <div className="meeting-lst-delete-wrapper" onClick={() => deleteEvent(event._id, key, "past")}>
                                                                    <img src={require("../../img/trash.svg")} alt="delete" />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </AccordionDetails>
                                        </Accordion>
                                    }
                                </div>
                            ) : (
                                <div style={{ "marginTop": "50px" }} className="d-flex align-items-center justify-content-center flex-column h-100">
                                    <div className="no-resourses-lst">
                                        <img src={require("../../img/no-data.svg")} alt="no-data" />
                                    </div>
                                    <div className="empty-list-txt">No Meetings are available</div>
                                </div>
                            )}
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};

export default EventListColumn; 