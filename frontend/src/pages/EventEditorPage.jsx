import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import HeaderComponent from "@/components/headerComponent";
import EventComponent from "@/components/eventComponent";
import RoomComponent from "@/components/roomComponent";
import LanguageComponent from "@/components/languageComponent";
import AgendaComponent from "@/components/agendaComponent";
import InterpreterComponent from "@/components/interpreterComponent";
import ParticipantsComponent from "@/components/participantsComponent";
import EventfilesComponent from "@/components/eventfilesComponent";
import { TabContent, TabPane, Nav, NavItem } from 'reactstrap';
import api from "@/service/language/languageService";
import helper from '@/utils/helper';
import apiEventService from "@/service/event/eventService";
import VDotsImg from "@/assets/img/vdots.svg"
import 'bootstrap/dist/css/bootstrap.min.css';

const EventEditorPage = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [eventDetails, setEventDetails] = useState([]);
    const [sessionDetails, setSessionDetails] = useState([]);
    const [roomDetails, setRoomDetails] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [interPreterLanguageDetails, setInterPreterLanguageDetails] = useState([]);
    const [editEventData, setEditEventData] = useState(null);
    const [callFn, setCallFn] = useState(false);


    
    const userCredentials = useRef(null);


    const getUserCredentials = useCallback(async () => {
        userCredentials.current = await helper.decodeEncodedItem(localStorage.getItem("userDetails"));
    }, []);

    useEffect(() => {
        if (userCredentials.current === null) {
            getUserCredentials();
        }
    }, [getUserCredentials]);


    
    const history = useHistory();
    const location = useLocation();
    const eventID = useRef(location.pathname.split("/")[2] || null).current;
 
    

    const handleLeavePage = useCallback((e) => {
        const confirmationMessage = 'Are you sure you want to leave?';
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }, []);

    const getLanguages = useCallback(() => {
        api.getLanguages().then((data) => {
            if (data.status === 200 && data.data.result.length > 0) {
                const langOptions = data.data.result.map((lang) => ({
                    value: lang._id,
                    label: lang.language,
                }));
                setLanguages(langOptions);
            }
        });
    }, []);

    const getEventByID = useCallback(() => {
        if (eventID) {
            apiEventService.getEventByID(eventID).then((data) => {
                if (data?.data?.data) {
                    setEditEventData(data.data.data);
                }
            }).catch(e => console.log(e.message));
        }
    }, [eventID]);

    useEffect(() => {
        getLanguages();
        if (eventID) {
            getEventByID();
        }
    }, [getLanguages, getEventByID, eventID]);

    useEffect(() => {
        if (userCredentials.current) {
            window.addEventListener("beforeunload", handleLeavePage);
        }
        return () => {
            if (userCredentials.current) {
                window.removeEventListener("beforeunload", handleLeavePage);
            }
        };
    }, [handleLeavePage]);

    const handleEventDetails = useCallback((events, type) => {
        if (events?.data) {
            setEventDetails(events.data);
            if (type !== "nomove") {
                setActiveTab('2');
            }
        }
    }, []);

    const handleSaveRooms = useCallback((roomData) => {
        const roomsArray = roomData ? roomData.map((rooms) => ({
            value: rooms._id,
            label: rooms.name,
        })) : [];
        setRoomDetails(roomsArray);
    }, []);

    const handleSaveInterpreterLanguage = useCallback((interPreterLanguage) => {
        const interpreterLang = interPreterLanguage ? interPreterLanguage.map((lang) => ({
            value: lang._id,
            label: lang.title,
        })) : [];
        setInterPreterLanguageDetails(interpreterLang);
    }, []);

    const handleSaveSessions = useCallback((sessionData) => {
        const sessionArray = sessionData ? sessionData.map((session) => ({
            value: session._id,
            label: session.name,
        })) : [];
        setSessionDetails(sessionArray);
    }, []);

    const stepToEvent = () => setActiveTab('1');
    const stepToEventFile = () => setActiveTab('2');
    const stepToRoom = () => setActiveTab('3');
    const stepToLanguage = () => setActiveTab('4');
    const stepToAgenda = () => setActiveTab('5');
    const stepToInterpreter = () => setActiveTab('6');
    const stepToParticipants = (flag) => {
        setActiveTab('7');
        setCallFn(flag);
    };
    
    return (
        <section className="scheduller-session" style={{color: 'white'}}>
            <HeaderComponent history={history} />
            <div className="scheduler-nav-sel-blk ">
                <div className="d-flex align-items-center justify-content-between scheduler-top-part">
                    {activeTab === "1" && <div className="active-nav-blk-mob">Event Details</div>}
                    {activeTab === "2" && <div className="active-nav-blk-mob">Event Files</div>}
                    {activeTab === "3" && <div className="active-nav-blk-mob">Rooms</div>}
                    {activeTab === "4" && <div className="active-nav-blk-mob">Languages</div>}
                    {activeTab === "5" && <div className="active-nav-blk-mob">Sessions</div>}
                    {activeTab === "6" && <div className="active-nav-blk-mob">Interpreters</div>}
                    {activeTab === "7" && <div className="active-nav-blk-mob">Participants</div>}
                    <Nav className="align-items-center schedule-navtabs">
                        <NavItem className="schedule-lst"> <span className={activeTab === '1' ? "active" : ""}>Event Details</span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '2' ? "active" : ""}>Event Files</span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '3' ? "active" : ""} >Rooms</span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '4' ? "active" : ""} >Languages</span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '5' ? "active" : ""} >Sessions</span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '6' ? "active" : ""} >Interpreters </span></NavItem>
                        <NavItem className="schedule-lst"> <span className={activeTab === '7' ? "active" : ""} >Participants</span></NavItem>
                    </Nav>
                    <div className="schedule-toggler-blk">
                        <div className="schedule-toggler"><img alt="settings" src={VDotsImg} /></div>
                    </div>
                    <div className="sidenav-blk">
                        <div className="d-flex align-items-center justify-content-between sidebar-top-part">
                            <span className="sidebar-settings-txt">Settings</span>
                            <span className="close">&times;</span>
                        </div>
                        <ul className="sidenav-menu-wrap">
                            <li><span>Schedule Meeting</span></li>
                        </ul>
                    </div>

                </div>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                        {eventID && editEventData && (
                            <EventComponent activeTab={activeTab} location={location} history={history} saveEventDetails={handleEventDetails} stepToEventFile={stepToEventFile} editEventData={editEventData} />
                        )}

                        {!eventID && (
                            <EventComponent activeTab={activeTab} location={location} history={history} saveEventDetails={handleEventDetails} stepToEventFile={stepToEventFile} />
                        )}
                        
                    </TabPane>
                    <TabPane tabId="2">
                        <EventfilesComponent activeTab={activeTab} stepToEvent={stepToEvent} stepToRoom={stepToRoom} saveEventDetails={handleEventDetails} eventData={eventDetails} location={location} />
                    </TabPane>
                    <TabPane tabId="3">
                        <RoomComponent activeTab={activeTab} stepToEventFile={stepToEventFile} stepToLanguage={stepToLanguage} saveRooms={handleSaveRooms} eventData={eventDetails} location={location}/>
                    </TabPane>
                    <TabPane tabId="4">
                        <LanguageComponent saveLanguageForInterpreter={handleSaveInterpreterLanguage} activeTab={activeTab} stepToRoom={stepToRoom} stepToAgenda={stepToAgenda} languages={languages} eventData={eventDetails} location={location}/>
                    </TabPane>
                    <TabPane tabId="5">
                        <AgendaComponent activeTab={activeTab} stepToLanguage={stepToLanguage} stepToInterpreter={stepToInterpreter} saveSessions={handleSaveSessions} rooms={roomDetails} eventData={eventDetails} location={location}/>
                    </TabPane>
                    <TabPane tabId="6">
                        <InterpreterComponent activeTab={activeTab} stepToParticipants={stepToParticipants} stepToAgenda={stepToAgenda} session={sessionDetails} languages={interPreterLanguageDetails} eventData={eventDetails} location={location}/>
                    </TabPane>
                    <TabPane tabId="7">
                        <ParticipantsComponent history={history} activeTab={activeTab} stepToInterpreter={stepToInterpreter} eventData={eventDetails} location={location} flag={callFn}/>
                    </TabPane>
                </TabContent>
            </div>
        </section>
    );
}

export default EventEditorPage;