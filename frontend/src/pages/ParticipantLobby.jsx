import React, { useState, useEffect, useCallback } from "react";
import apiEventService from "@/service/event/eventService";
import Swal from 'sweetalert2';
import Header from "@/components/headerComponent";
import moment from "moment";
import 'moment-timezone';
import helper from '@/utils/helper';
import jwt from "jwt-simple";
import { Modal } from 'reactstrap';
import Loader from 'react-loader-spinner';

import { Accordion } from '@mui/material';
import { AccordionSummary } from '@mui/material';
import { AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import jsPDF from 'jspdf';
import 'jspdf-autotable'
import html2canvas from 'html2canvas';
import ClipLoader from "react-spinners/ClipLoader";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Toast } from "@/components/toastComponent";
import CopyURLImg from "@/assets/img/copy-url.svg"
import InfoIcon from "@/assets/img/info.svg"
import EditIcon from "@/assets/img/edit-pencil.svg"
import TrashIcon from "@/assets/img/trash.svg"
import NoDataIcon from "@/assets/img/no-data.svg"
import InformationIcon from "@/assets/img/information.svg"
import LogoIcon from "@/assets/img/logo-2-01.png"
import apiSessionService from "@/service/event/sessionService"
import { REACT_APP_API_IMAGE_URL, REACT_APP_JWT_SECRET, REACT_APP_MEETING_URL, REACT_APP_MEETING_LINK_INTERPRETER, REACT_APP_MEETING_LINK_LEARNER, REACT_APP_MEETING_LINK_MODERATOR, REACT_APP_MEETING_LINK_SECONDARY_MODERATOR, REACT_APP_MEETING_LINK_SIGNLANGUAGE, REACT_APP_MEETING_LINK_SPEAKER, REACT_APP_MEETING_LINK_STREAMOUT, REACT_APP_URL, REACT_APP_API_URL, REACT_APP_MEETINGCODE_LENGTH, REACT_APP_OPENTOK_KEY, REACT_APP_OPENTOK_SECRET, REACT_APP_S3_UPLOADS_URL, REACT_APP_S3_URL } from "@/constants/URLConstant";
import apiEventUserService from "@/service/event/eventUserService";
import apiEventSessionService from "@/service/event/sessionService";
import { LuClock } from "react-icons/lu";
import { IoCalendarNumberOutline } from "react-icons/io5";
import ApiLoader from '@/components/Loader';

const ParticipantLobby = ({ history }) => {
    // State management
    const [state, setState] = useState({
        eventList: [],
        eventRooms: [],
        eventAgenda: [],
        eventCode: '',
        fetchEventId: "",
        eventStatus: '',
        pastEvents: [],
        currentEvents: [],
        upcomingEvents: [],
        moderator: false,
        eventInfo: "",
        isModalOpen: false,
        logoIMG: '',
        interpreterRoomDetails: [],
        fetchEvents: false,
        fetchRooms: false,
        fetchSessions: false,
        fetchPollReport: false,
        fetchUserReport: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        eventRepeatStatus: false,
        showSessions: false,
        showPollReports: false,
        pollsList: [],
        pollreports: [],
        userstreamreports: [],
        originalStreamReport: [],
        allowUserReportDisplay: false,
        showEventUserStreamReport: false,
        accordionPanel: "panel1a",
        exportUserStreamReports: [],
        fetchedEventDetails: "",
        exportingPollReport: false,
        exportingStreamReport: false,
        joiningMeeting: false,
        archives: [],
        showEventRecordings: false,
        selectedDateFilter: new Date(),
        dateFilterActive: false,
        csvStreamRecordData: [],
        apiresponse: false,
        loadingAgenda: false
    });

    // Refs for component data
    const [userCredentials, setUserCredentials] = useState(null);
    const [eventData, setEventData] = useState('');
    const [sessionDataDetails, setSessionDataDetails] = useState('');
    const [loading, setLoading] = useState(true);



    //decode user 
    useEffect(() => {
        const userDetails = localStorage.getItem("userDetails");
        if (!userDetails || userCredentials) return;
        const loadUserCredentials = async () => {
            if (userDetails) {
                const decoded = await helper.decodeEncodedItem(userDetails);
                setUserCredentials(decoded);
            } else {
                setUserCredentials(null);
            }
            setLoading(false);
        };

        loadUserCredentials();
    }, []);
    // Helper functions
    const addZero = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };

    const diff_minutes = (dt2, dt1) => {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    };

    const diff_weeks = (dt2, dt1) => {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24 * 7);
        return Math.abs(Math.ceil(diff));
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setState(prev => ({ ...prev, accordionPanel: isExpanded ? panel : false }));
    };

    const handleApiError = (status) => {
        if (status === 401) {
            Toast.fire({
                icon: 'warning',
                title: "Unauthorized Access"
            });
        } else if (status === 422) {
            Toast.fire({
                icon: 'warning',
                title: "Please revalidate the form and submit"
            });
        } else {
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            });
        }
    };

    const timeConvert = (value) => {
        var hours = Math.floor(value / 60 / 60);
        var minutes = Math.floor(value / 60) - (hours * 60);
        var seconds = Math.floor(value % 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return hours + ' : ' + minutes + ' : ' + seconds;
    };

    const format_poll_percentage = (n) => {
        var result = (n - Math.floor(n)) !== 0;
        if (result)
            return n.toFixed(2);
        else
            return n;
    };

    const sortEventList = useCallback((eventlist, flag = false) => {
        setState(prev => ({
            ...prev,
            pastEvents: [],
            currentEvents: [],
            upcomingEvents: []
        }));

        let currentDate = moment(helper.getDate(new Date())).format('YYYY-MM-DD');
        let currentEventList = [];
        let pastEventList = [];
        let upcomingEventList = [];

        if (eventlist !== "" && eventlist !== undefined && eventlist.length > 0) {
            eventlist.map((event, key) => {
                let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                let meetingDate;
                if (event.start_date_time !== undefined && event.start_date_time !== null && event.start_date_time !== "") {
                    meetingDate = moment(event.start_date_time).tz(timezone).format('YYYY-MM-DD');
                } else {
                    meetingDate = moment(event.date).tz(timezone).format('YYYY-MM-DD');
                }

                let startDateTime = (event.start_date_time !== undefined && event.start_date_time !== null && event.start_date_time !== "") ? new Date(event.start_date_time) : "";
                let eventDate = new Date(event.date);

                if (event.repeatWeekly === true) {
                    if (meetingDate < currentDate) {
                        let numOfWeeksForEventDate = diff_weeks(new Date(), eventDate);

                        if (startDateTime !== undefined && startDateTime !== null && startDateTime !== "") {
                            let numOfWeeksForEventStartDateTime = diff_weeks(new Date(), startDateTime);
                            startDateTime = startDateTime.setDate(startDateTime.getDate() + numOfWeeksForEventStartDateTime * 7);
                        }

                        eventDate = eventDate.setDate(eventDate.getDate() + numOfWeeksForEventDate * 7);
                    }
                }

                let updatedCurrentTime = moment(new Date()).format('MM/DD/YYYY HH:mm:ss');

                let eventStartDateTime;
                if (startDateTime !== undefined && startDateTime !== null && startDateTime !== "") {
                    eventStartDateTime = moment(startDateTime).format('MM/DD/YYYY HH:mm:ss');
                } else {
                    eventStartDateTime = moment(eventDate).format('MM/DD/YYYY HH:mm:ss');
                }

                let eventStartTime = new Date(eventStartDateTime);
                eventStartTime = new Date(eventStartTime).setHours(addZero(new Date(event.start_time).getHours()));
                eventStartTime = new Date(eventStartTime).setMinutes(addZero(new Date(event.start_time).getMinutes()));
                eventStartTime = new Date(eventStartTime).setSeconds(addZero(new Date(event.start_time).getSeconds()));
                eventStartTime = new Date(eventStartTime);

                let updatedEventStartTime = moment(eventStartTime).tz(timezone).format('MM/DD/YYYY HH:mm:ss');
                let dts1 = new Date(event.start_time);
                let dts2 = new Date(event.end_time);

                var updatedEventEndTime = new Date(eventStartTime);
                updatedEventEndTime.setMinutes(updatedEventEndTime.getMinutes() + diff_minutes(dts1, dts2));
                updatedEventEndTime = moment(updatedEventEndTime).format('MM/DD/YYYY HH:mm:ss');

                if (new Date(updatedEventStartTime) <= new Date(updatedCurrentTime) && new Date(updatedEventEndTime) >= new Date(updatedCurrentTime)) {
                    if (flag === true) {
                        viewRooms(event._id, event.event_code, 1, event.repeatWeekly);
                    }
                    currentEventList.push(event);
                } else if (new Date(updatedEventStartTime) > new Date(updatedCurrentTime)) {
                    if (flag === true) {
                        viewRooms(event._id, event.event_code, 1, event.repeatWeekly);
                    }
                    currentEventList.push(event);
                } else {
                    if (flag === true) {
                        viewRooms(event._id, event.event_code, 0, event.repeatWeekly);
                    }
                    pastEventList.push(event);
                }

                return true;
            });

            setState(prev => ({
                ...prev,
                pastEvents: pastEventList,
                currentEvents: currentEventList,
                upcomingEvents: upcomingEventList
            }));
        }
    }, []);

    const getEventDetails = useCallback(() => {
        if (userCredentials && userCredentials !== null &&
            userCredentials !== "" && userCredentials !== undefined && userCredentials.id && userCredentials.id !== null &&
            userCredentials.id !== "" && userCredentials.id !== undefined) {


            let getEventDetailsData = {
                user_id: userCredentials.id,
                finish: true
            };

            setState(prev => ({ ...prev, fetchEvents: true }));

            apiEventService.getEvents(getEventDetailsData).then((data) => {
                setTimeout(() => {
                    setState(prev => ({ ...prev, apiresponse: true }));
                }, 1000);

                setState(prev => ({ ...prev, fetchEvents: false }));

                try {
                    if (data && data !== undefined && data !== null && data !== "") {
                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                            if (data.data.status && data.data.status === true && data.data.data && data.data.data.length > 0) {
                                sortEventList(data.data.data);
                                setState(prev => ({ ...prev, eventList: data.data.data }));
                            }
                        } else {
                            handleApiError(data.status);
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        });
                    }
                } catch (e) {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    });
                }
            });
        } else {
            // Toast.fire({
            //     icon: 'warning',
            //     title: "Something went wrong. Please try again!"
            // });
            setTimeout(() => {
                setState(prev => ({ ...prev, apiresponse: true }));
            }, 1000);
        }
    }, [userCredentials, sortEventList]);

    const viewRooms = useCallback((eventID, eventCode, flag, repeeatWeekly = false, showreport = false, archives = []) => {
        setState(prev => ({
            ...prev,
            fetchEventId: eventID,
            eventRooms: [],
            eventAgenda: [],
            pollreports: [],
            userstreamreports: [],
            showSessions: false,
            showPollReports: false,
            showEventUserStreamReport: false,
            allowUserReportDisplay: showreport,
            eventCode: '',
            eventStatus: flag,
            eventRepeatStatus: repeeatWeekly,
            joiningMeeting: false,
            archives: archives,
            showEventRecordings: false
        }));

        if (showreport === true && userCredentials && userCredentials !== null && userCredentials !== "" && userCredentials !== undefined) {
            let meetingListClass = document.querySelectorAll(".meeting_list");
            for (let i = 0; i < meetingListClass.length; i++) {
                meetingListClass[i].classList.remove('active');
            }
            let addActiveClass = document.getElementsByClassName("meeting_" + eventID);
            if (addActiveClass[0]) {
                addActiveClass[0].className += " active";
            }
        }

        if (eventID !== null && eventID !== "" && eventID !== undefined) {
            setState(prev => ({ ...prev, fetchRooms: true, pollsList: [] }));

            let eventDetails = {
                event_id: eventID
            };

            apiSessionService.getEventRooms(eventDetails).then((data) => {
                setState(prev => ({ ...prev, fetchRooms: false }));

                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        let eventRoomDetails = data.data.data;
                        let roomArray = [];

                        if (eventData.user_role === 'interpreter') {
                            let getRoomDetails = {
                                session_id: sessionDataDetails
                            };

                            apiEventSessionService.getRoomDetails(getRoomDetails).then((roomData) => {
                                if (roomData && roomData !== undefined && roomData !== null && roomData !== "") {
                                    if (roomData.status && roomData.status !== undefined && roomData.status !== null && roomData.status === 200) {
                                        if (roomData.data.status && roomData.data.status === true && roomData.data.data && roomData.data.data.length > 0) {
                                            setState(prev => ({ ...prev, interpreterRoomDetails: roomData.data.data }));

                                            if (roomData.data.data.length > 0) {
                                                roomData.data.data.map((roomDetails) => {
                                                    let roomDataFiltered = eventRoomDetails.filter(eventRoom => (eventRoom._id === roomDetails.room));
                                                    if (roomDataFiltered !== "" && roomDataFiltered.length > 0) {
                                                        let alreadyExisting = roomArray.filter((rooms) => JSON.stringify(rooms) === JSON.stringify(roomDataFiltered[0]));
                                                        if (alreadyExisting.length === 0) {
                                                            roomArray.push(roomDataFiltered[0]);
                                                        }
                                                    }
                                                    return true;
                                                });
                                                setState(prev => ({ ...prev, eventRooms: roomArray, eventCode: eventCode }));
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            if (data.data.status && data.data.status === true) {
                                setState(prev => ({ ...prev, eventRooms: data.data.data, eventCode: eventCode }));
                            }
                        }
                    } else {
                        handleApiError(data.status);
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    });
                }
            });

            if (showreport === true) {
                apiEventSessionService.getSessionsForEvent(eventDetails).then((data) => {
                    if (data !== undefined && data !== null && data !== "") {
                        if (data.status !== undefined && data.status !== null && data.status === 200) {
                            if (data.data.data !== undefined && data.data.data !== null && data.data.data !== "") {
                                var sessionsList = data.data.data;

                                if (sessionsList !== undefined && sessionsList !== null && sessionsList !== "" && sessionsList.length > 0) {
                                    let sessionIdArray = [];

                                    for (var s = 0; s < sessionsList.length; s++) {
                                        var sessionId = sessionsList[s]['_id'];
                                        sessionIdArray.push(sessionId);
                                    }

                                    if (sessionIdArray !== undefined && sessionIdArray !== null && sessionIdArray !== "" && sessionIdArray.length > 0) {
                                        let pollFilter = {
                                            session_id: sessionIdArray
                                        };

                                        apiEventService.getPollsForEvent(pollFilter).then((pollData) => {
                                            if (pollData !== undefined && pollData !== null && pollData !== "") {
                                                if (pollData.status !== undefined && pollData.status !== null && pollData.status === 200) {
                                                    if (pollData.data.data !== undefined && pollData.data.data !== null && pollData.data.data !== "") {
                                                        var pollsList = pollData.data.data;
                                                        pollsList['event_id'] = eventID;
                                                        if (pollsList !== undefined && pollsList !== null && pollsList !== "" && pollsList.length > 0) {
                                                            setState(prev => ({ ...prev, pollsList: pollsList }));
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    }, [eventData, sessionDataDetails, userCredentials]);

    const viewRecordings = () => {
        let pollListClass = document.querySelectorAll(".poll_list");
        for (let i = 0; i < pollListClass.length; i++) {
            pollListClass[i].classList.remove('active');
        }

        let roomListClass = document.querySelectorAll(".room_list");
        for (let i = 0; i < roomListClass.length; i++) {
            roomListClass[i].classList.remove('active');
        }

        setState(prev => ({
            ...prev,
            showSessions: false,
            showEventUserStreamReport: false,
            showPollReports: false,
            showEventRecordings: true
        }));
    };

    const viewUserReport = () => {
        let pollListClass = document.querySelectorAll(".poll_list");
        for (let i = 0; i < pollListClass.length; i++) {
            pollListClass[i].classList.remove('active');
        }

        let roomListClass = document.querySelectorAll(".room_list");
        for (let i = 0; i < roomListClass.length; i++) {
            roomListClass[i].classList.remove('active');
        }

        if (state.fetchEventId !== undefined && state.fetchEventId !== null && state.fetchEventId !== "") {
            let eventDetails = state.eventList.filter(event => (event._id === state.fetchEventId))[0];
            setState(prev => ({ ...prev, fetchedEventDetails: eventDetails }));
        }

        setState(prev => ({
            ...prev,
            fetchUserReport: true,
            showSessions: false,
            showEventUserStreamReport: true,
            showPollReports: false,
            showEventRecordings: false
        }));

        let eventDetails = {
            event_id: state.fetchEventId
        };

        apiEventUserService.getUserStreamReport(eventDetails).then((data) => {
            setState(prev => ({ ...prev, fetchUserReport: false }));

            if (data !== undefined && data !== null && data !== "") {
                if (data.status !== undefined && data.status !== null && data.status === 200) {
                    if (data.data.data !== undefined && data.data.data !== null && data.data.data !== "") {
                        setState(prev => ({ ...prev, originalStreamReport: data.data.data }));
                        onProcesUserStreamReport(data.data.data);
                    }
                }
            }
        });
    };

    const onProcesUserStreamReport = (dataRecived) => {
        let userstreamreports = [];

        if (state.dateFilterActive) {
            for (let key in dataRecived) {
                let dataval = dataRecived[key];
                const date1 = new Date(dataval.start_time);
                const date2 = state.selectedDateFilter;

                if (
                    date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate()
                ) {
                    userstreamreports.push(dataval);
                }
            }
        } else {
            userstreamreports = dataRecived;
        }

        setState(prev => ({ ...prev, userstreamreports: userstreamreports }));
        setStreamReport(userstreamreports);
    };

    const setStreamReport = (streamreports) => {
        let completeStreamReport = [];

        if (streamreports !== undefined && streamreports !== null && streamreports !== "" && streamreports.length > 0) {
            for (var sr = 0; sr < streamreports.length; sr++) {
                let individualStreamReport = {};

                let username = streamreports[sr]['name'];
                let useremail = streamreports[sr]['email'];
                let userrole = streamreports[sr]['role'];
                let startTime = (streamreports[sr]['start_time'] !== undefined && streamreports[sr]['start_time'] !== null && streamreports[sr]['start_time'] !== "") ? streamreports[sr]['start_time'] : "";
                let endTime = (streamreports[sr]['end_time'] !== undefined && streamreports[sr]['end_time'] !== null && streamreports[sr]['end_time'] !== "") ? streamreports[sr]['end_time'] : "";

                let streamedDuration = 0;

                if (startTime !== "" && endTime !== "") {
                    let dt1 = new Date(startTime);
                    let dt2 = new Date(endTime);
                    streamedDuration = Math.abs(dt1 - dt2) / 1000;
                }

                let displayStartTime = "-";
                if (startTime !== "") {
                    displayStartTime = moment(startTime).tz(state.timezone).format('Do MMM YYYY, hh:mm a');
                }
                let displayEndTime = "-";
                if (endTime !== "") {
                    displayEndTime = moment(endTime).tz(state.timezone).format('Do MMM YYYY, hh:mm a');
                }

                individualStreamReport.name = username;
                individualStreamReport.email = useremail;
                individualStreamReport.role = userrole[0].toUpperCase() + userrole.slice(1);
                individualStreamReport.start_time = displayStartTime;
                individualStreamReport.end_time = displayEndTime;
                individualStreamReport.duration = timeConvert(streamedDuration);

                completeStreamReport.push(individualStreamReport);
            }
        }

        setState(prev => ({ ...prev, exportUserStreamReports: completeStreamReport }));
        generateExcelExportData(completeStreamReport);
    };

    const viewPollReport = (pollId, eventID, pollTitle) => {
        if (eventID !== undefined && eventID !== null && eventID !== "") {
            let eventDetails = state.eventList.filter(event => (event._id === eventID))[0];
            eventDetails['poll_title'] = pollTitle;
            setState(prev => ({ ...prev, fetchedEventDetails: eventDetails }));
        }

        if (pollId !== undefined && pollId !== null && pollId !== "") {
            setState(prev => ({
                ...prev,
                fetchPollReport: true,
                showSessions: false,
                showEventUserStreamReport: false,
                showPollReports: true
            }));

            let roomListClass = document.querySelectorAll(".room_list");
            for (let i = 0; i < roomListClass.length; i++) {
                roomListClass[i].classList.remove('active');
            }

            let pollListClass = document.querySelectorAll(".poll_list");
            for (let i = 0; i < pollListClass.length; i++) {
                pollListClass[i].classList.remove('active');
            }
            let addActiveClass = document.getElementsByClassName("poll_" + pollId);
            if (addActiveClass[0]) {
                addActiveClass[0].className += " active";
            }

            let pollDetails = {
                poll_id: pollId
            };

            apiEventService.getPollReport(pollDetails).then((data) => {
                setState(prev => ({ ...prev, fetchPollReport: false }));

                if (data !== undefined && data !== null && data !== "") {
                    if (data.status !== undefined && data.status !== null && data.status === 200) {
                        if (data.data.data !== undefined && data.data.data !== null && data.data.data !== "") {
                            setState(prev => ({ ...prev, pollreports: data.data.data }));
                        }
                    }
                }
            });
        }
    };

    const viewAgenda = (roomID) => {
        setState(prev => ({ ...prev, eventAgenda: [], joiningMeeting: false }));

        if (roomID !== null && roomID !== "" && roomID !== undefined) {
            setState(prev => ({
                ...prev,
                fetchSessions: true,
                showSessions: true,
                showPollReports: false,
                showEventUserStreamReport: false,
                loadingAgenda: true
            }));

            let pollListClass = document.querySelectorAll(".poll_list");
            for (let i = 0; i < pollListClass.length; i++) {
                pollListClass[i].classList.remove('active');
            }

            let roomListClass = document.querySelectorAll(".room_list");
            for (let i = 0; i < roomListClass.length; i++) {
                roomListClass[i].classList.remove('active');
            }
            let addActiveClass = document.getElementsByClassName("room_" + roomID);
            if (addActiveClass[0]) {
                addActiveClass[0].className += " active";
            }

            let roomDetails = {
                room: roomID
            };

            if (eventData.user_role === 'interpreter' || eventData.user_role === 'listener') {
                roomDetails['private'] = false;
            }

            apiEventSessionService.getEventAgenda(roomDetails).then((data) => {
                setState(prev => ({ ...prev, fetchSessions: false, loadingAgenda: false }));

                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        if (data.data.status && data.data.status === true) {
                            if (data.data.data.length > 0) {
                                let eventDetails = data.data.data;

                                for (var e = 0; e < eventDetails.length; e++) {
                                    var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                                    let currentDate = moment(helper.getDate(new Date())).format('YYYY-MM-DD');

                                    let agendaMainDate;
                                    if (eventDetails[e]['start_date_time'] !== undefined && eventDetails[e]['start_date_time'] !== null && eventDetails[e]['start_date_time'] !== "") {
                                        agendaMainDate = moment(eventDetails[e]['start_date_time']).tz(timezone).format('YYYY-MM-DD');
                                    } else {
                                        agendaMainDate = moment(eventDetails[e]['date']).tz(timezone).format('YYYY-MM-DD');
                                    }

                                    let agendaStartDateTime = (eventDetails[e]['start_date_time'] !== undefined && eventDetails[e]['start_date_time'] !== null && eventDetails[e]['start_date_time'] !== "") ? new Date(eventDetails[e]['start_date_time']) : "";
                                    let agendaDate = new Date(eventDetails[e]['date']);

                                    if (state.eventRepeatStatus !== undefined && state.eventRepeatStatus !== null && state.eventRepeatStatus === true) {
                                        if (agendaMainDate < currentDate) {
                                            let numOfWeeksForAgendaDate = diff_weeks(new Date(), agendaDate);

                                            if (agendaStartDateTime !== undefined && agendaStartDateTime !== null && agendaStartDateTime !== "") {
                                                let numOfWeeksForAgendaStartDateTime = diff_weeks(new Date(), agendaStartDateTime);
                                                agendaStartDateTime = agendaStartDateTime.setDate(agendaStartDateTime.getDate() + numOfWeeksForAgendaStartDateTime * 7);
                                            }

                                            agendaDate = agendaDate.setDate(agendaDate.getDate() + numOfWeeksForAgendaDate * 7);
                                        }
                                    }

                                    let sessionStartDateTime;
                                    if (agendaStartDateTime !== undefined && agendaStartDateTime !== null && agendaStartDateTime !== "") {
                                        sessionStartDateTime = moment(agendaStartDateTime).format('MM/DD/YYYY HH:mm:ss');
                                    } else {
                                        sessionStartDateTime = moment(agendaDate).format('MM/DD/YYYY HH:mm:ss');
                                    }

                                    let sessionStartTime = new Date(sessionStartDateTime);
                                    sessionStartTime = new Date(sessionStartTime).setHours(addZero(new Date(eventDetails[e]['start_time']).getHours()));
                                    sessionStartTime = new Date(sessionStartTime).setMinutes(addZero(new Date(eventDetails[e]['start_time']).getMinutes()));
                                    sessionStartTime = new Date(sessionStartTime).setSeconds(addZero(new Date(eventDetails[e]['start_time']).getSeconds()));
                                    sessionStartTime = new Date(sessionStartTime);

                                    let sessionEndTime = sessionStartDateTime;
                                    sessionEndTime = new Date(sessionEndTime).setHours(addZero(new Date(eventDetails[e]['end_time']).getHours()));
                                    sessionEndTime = new Date(sessionEndTime).setMinutes(addZero(new Date(eventDetails[e]['end_time']).getMinutes()));
                                    sessionEndTime = new Date(sessionEndTime).setSeconds(addZero(new Date(eventDetails[e]['end_time']).getSeconds()));
                                    sessionEndTime = new Date(sessionEndTime);

                                    eventDetails[e]['session_start_time'] = moment(sessionStartTime).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
                                    eventDetails[e]['session_end_time'] = sessionEndTime;

                                    let dts1 = new Date(eventDetails[e]['start_time']);
                                    let dts2 = new Date(eventDetails[e]['end_time']);

                                    let updatedSessionStartTime = moment(sessionStartTime).tz(timezone).format('MM/DD/YYYY HH:mm:ss');
                                    let updatedSessionCurrentTime = moment(new Date()).format('MM/DD/YYYY HH:mm:ss');
                                    var updatedSessionEndTime = new Date(sessionStartTime);
                                    updatedSessionEndTime.setMinutes(updatedSessionEndTime.getMinutes() + diff_minutes(dts1, dts2));
                                    updatedSessionEndTime = moment(updatedSessionEndTime).format('MM/DD/YYYY HH:mm:ss');

                                    eventDetails[e]['session_end_time'] = new Date(updatedSessionEndTime);

                                    if (new Date(updatedSessionStartTime) <= new Date(updatedSessionCurrentTime) && new Date(updatedSessionEndTime) >= new Date(updatedSessionCurrentTime)) {
                                        eventDetails[e]['type'] = "current";
                                    } else if (new Date(updatedSessionStartTime) > new Date(updatedSessionCurrentTime)) {
                                        eventDetails[e]['type'] = "current";
                                    } else {
                                        eventDetails[e]['type'] = "past";
                                    }
                                }

                                if (eventData.user_role === 'interpreter') {
                                    if (state.interpreterRoomDetails.length > 0) {
                                        let sessionArray = [];
                                        state.interpreterRoomDetails.map((sessionDetails) => {
                                            let sessionData = eventDetails.filter(eventRoom => (eventRoom._id === sessionDetails._id));
                                            if (sessionData !== "" && sessionData !== undefined && sessionData.length > 0) {
                                                let alreadyExisting = sessionArray.filter((rooms) => JSON.stringify(rooms) === JSON.stringify(sessionData[0]));
                                                if (alreadyExisting.length === 0) {
                                                    sessionArray.push(sessionData[0]);
                                                }
                                            }
                                            return true;
                                        });

                                        if (sessionArray.length > 0) {
                                            sessionArray = sessionArray.sort((a, b) => new Date(a.start_date_time).getTime() - new Date(b.start_date_time).getTime());
                                        }
                                        setState(prev => ({ ...prev, eventAgenda: sessionArray }));
                                    }
                                } else {
                                    setState(prev => ({ ...prev, eventAgenda: eventDetails }));
                                }
                            }
                        }
                    } else {
                        handleApiError(data.status);
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    });
                }
            }).catch((error) => {
                setState(prev => ({ ...prev, loadingAgenda: false }));
            });
        }
    };

    const createMeeting = () => {
        history.push("/schedule");
    };

    const copyLink = (link) => {
        navigator.clipboard.writeText(link);
        Toast.fire({
            icon: 'success',
            title: 'Link copied successfully'
        });
    };

    const editEvent = (id) => {
        if (id !== undefined && id !== null) {
            history.push("/events/" + id);
        }
    };

    const deleteEvent = (id, index, type) => {
        Swal.fire({
            title: '',
            text: "Are you sure you want to delete this event?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: "Yes, Proceed",
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#00d2a5',
            customClass: {
                confirmButton: 'green-bg-white-f-btn'
            },
            focusConfirm: false,
            focusCancel: true
        }).then((result) => {
            if (result.value) {
                try {
                    apiEventService.deleteEvent(id).then((data) => {
                        if (data && data !== undefined && data !== null && data !== "") {
                            if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                Toast.fire({
                                    icon: 'success',
                                    title: "Event deleted successfully"
                                });

                                if (type === "current") {
                                    setState(prev => {
                                        const newCurrentEvents = [...prev.currentEvents];
                                        newCurrentEvents.splice(index, 1);
                                        return { ...prev, currentEvents: newCurrentEvents };
                                    });
                                } else if (type === "past") {
                                    setState(prev => {
                                        const newPastEvents = [...prev.pastEvents];
                                        newPastEvents.splice(index, 1);
                                        return { ...prev, pastEvents: newPastEvents };
                                    });
                                }
                            } else {
                                handleApiError(data.status);
                            }
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "No response from the server. Please try again!"
                            });
                        }
                    });
                } catch (e) {
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    });
                }
            }
        });
    };

    const goForEvents = (session) => {
        if (session !== undefined) {
            setState(prev => ({ ...prev, joiningMeeting: true }));

            let checkEventJoiningUserDetails = {
                event_id: eventData.eventId
            };

            let loggedInUserRole = "";

            if (userCredentials !== undefined && userCredentials !== null && userCredentials !== "" && userCredentials.name !== undefined && userCredentials.name !== null && userCredentials.name !== "" && userCredentials.id !== undefined && userCredentials.id !== null && userCredentials.id !== "" && userCredentials.email !== undefined && userCredentials.email !== null && userCredentials.email !== "") {
                checkEventJoiningUserDetails.email = userCredentials.email.toLowerCase();
                loggedInUserRole = "moderator";
            } else {
                checkEventJoiningUserDetails.email = eventData.user_email.toLowerCase();
                loggedInUserRole = eventData.user_role;
            }

            if (state.fetchEventId !== undefined && state.fetchEventId !== null && state.fetchEventId !== "") {
                checkEventJoiningUserDetails.event_id = state.fetchEventId;
            }

            apiEventUserService.checkEventUserDetailsExists(checkEventJoiningUserDetails).then((data) => {
                try {
                    if (data && data !== undefined && data !== null && data !== "") {
                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                            if (data.data.status !== undefined && data.data.status !== null && data.data.status === "success" && data.data.data !== undefined && data.data.data !== null && data.data.data !== "" && data.data.data.length > 0) {
                                var eventUsersAllData = data.data.data;

                                if (eventUsersAllData.length > 0) {
                                    let joiningFlag = 1;
                                    let currentTime = moment(new Date()).tz(state.timezone).format('MM/DD/YYYY HH:mm:ss');

                                    for (var e = 0; e < eventUsersAllData.length; e++) {
                                        let streamEndTime = eventUsersAllData[e]['end_time'];
                                        streamEndTime = moment(streamEndTime).add(60, 's').tz(state.timezone).format('MM/DD/YYYY HH:mm:ss');
                                        streamEndTime = new Date(streamEndTime);
                                        currentTime = new Date(currentTime);

                                        if (currentTime < streamEndTime) {
                                            joiningFlag = 0;
                                        }

                                        if (e === (eventUsersAllData.length - 1)) {
                                            if (joiningFlag === 1) {
                                                let eventUserData = eventUsersAllData.filter(eventuser => (eventuser.role === loggedInUserRole))[0];

                                                if (eventUserData !== undefined && eventUserData !== null && eventUserData !== "") {
                                                    if ((loggedInUserRole === "interpreter" && eventUserData._id === eventData.loggedin_user_id) || loggedInUserRole !== "interpreter") {
                                                        if (eventData.user_name !== undefined && eventData.user_name !== "" && eventData.user_name !== eventUserData.name && loggedInUserRole !== "interpreter") {
                                                            let userDetails = {
                                                                name: eventData.user_name,
                                                                id: eventUserData._id
                                                            };
                                                            apiEventUserService.updateEventUserDetails(userDetails).then((updateData) => {
                                                                // Handle update response if needed
                                                            });
                                                        }
                                                        setState(prev => ({ ...prev, joiningMeeting: false }));

                                                        if (eventData.user_selected_language !== eventUserData.language) {
                                                            updateSelectedLanguage(eventUserData);
                                                        }

                                                        let session_id = session._id;
                                                        let url = buildMeetingUrl(session_id, eventUserData);
                                                        window.location.href = url;
                                                    } else {
                                                        handleInterpreterUserRecreation(eventUserData, session, loggedInUserRole);
                                                    }
                                                } else {
                                                    createNewEventUser(session, loggedInUserRole);
                                                }
                                            } else {
                                                setState(prev => ({ ...prev, joiningMeeting: false }));
                                                Toast.fire({
                                                    icon: 'warning',
                                                    title: "You have tried login with the same email ID, Please try after 30 sec or login with a different email."
                                                });
                                            }
                                        }
                                    }
                                }
                            } else {
                                createNewEventUser(session, loggedInUserRole);
                            }
                        } else {
                            setState(prev => ({ ...prev, joiningMeeting: false }));
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong. Please try again!"
                            });
                        }
                    } else {
                        setState(prev => ({ ...prev, joiningMeeting: false }));
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        });
                    }
                } catch (e) {
                    setState(prev => ({ ...prev, joiningMeeting: false }));
                    console.log(e.message);
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    });
                }
            });
        }
    };

    const buildMeetingUrl = (session_id, eventUserData) => {
        let url;
        if (eventData.streamOut !== undefined && eventData.streamOut !== null && eventData.streamOut === true && eventData.meetingCode !== undefined && eventData.meetingCode !== null && eventData.meetingCode.substring(0, 2) === "ls") {
            url = REACT_APP_MEETING_URL + session_id + '/listenerhls/' + eventData.user_name + '/' + eventUserData._id;
        } else if (eventData.signLanguageMode !== undefined && eventData.signLanguageMode !== null && eventData.signLanguageMode === true && eventData.meetingCode !== undefined && eventData.meetingCode !== null && eventData.meetingCode.substring(0, 2) === "ss") {
            url = REACT_APP_MEETING_URL + session_id + '/speakerslm/' + eventData.user_name + '/' + eventUserData._id;
        } else if (eventData.meetingCode !== undefined && eventData.meetingCode !== null && eventData.meetingCode.substring(0, 1) === "a") {
            url = REACT_APP_MEETING_URL + session_id + '/moderator-s/' + eventData.user_name + '/' + eventUserData._id;
        } else {
            url = REACT_APP_MEETING_URL + session_id + '/' + eventUserData.role + '/' + eventData.user_name + '/' + eventUserData._id;
        }
        return url;
    };

    const handleInterpreterUserRecreation = (eventUserData, session, loggedInUserRole) => {
        apiEventService.deleteEventUser(eventUserData._id).then((data) => {
            if (data && data !== undefined && data !== null && data !== "") {
                if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    createNewEventUser(session, loggedInUserRole);
                } else {
                    handleApiError(data.status);
                }
            } else {
                Toast.fire({
                    icon: 'warning',
                    title: "No response from the server. Please try again!"
                });
            }
        });
    };

    const createNewEventUser = (session, loggedInUserRole) => {
        let eventJoiningUserDetails = {
            event_id: eventData.eventId,
            role: loggedInUserRole
        };

        if (loggedInUserRole === "interpreter") {
            eventJoiningUserDetails._id = eventData.loggedin_user_id;
        }

        if (userCredentials !== undefined && userCredentials !== null && userCredentials !== "" && userCredentials.name !== undefined && userCredentials.name !== null && userCredentials.name !== "" && userCredentials.id !== undefined && userCredentials.id !== null && userCredentials.id !== "" && userCredentials.email !== undefined && userCredentials.email !== null && userCredentials.email !== "") {
            eventJoiningUserDetails.name = userCredentials.name;
            eventJoiningUserDetails.email = userCredentials.email.toLowerCase();
            eventJoiningUserDetails.role = "moderator";
        } else {
            eventJoiningUserDetails.name = eventData.user_name;
            eventJoiningUserDetails.email = eventData.user_email.toLowerCase();
        }

        if (state.fetchEventId !== undefined && state.fetchEventId !== null && state.fetchEventId !== "") {
            eventJoiningUserDetails.event_id = state.fetchEventId;
        }
        eventJoiningUserDetails.language = eventData.user_selected_language;

        apiEventUserService.saveEventUserDetails(eventJoiningUserDetails).then((data) => {
            if (data && data !== undefined && data !== null && data !== "") {
                if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    if (data.data.status !== undefined && data.data.status !== null && data.data.status === "success" && data.data.data !== undefined && data.data.data !== null && data.data.data !== "") {
                        setState(prev => ({ ...prev, joiningMeeting: false }));

                        let session_id = session._id;
                        let url = buildMeetingUrl(session_id, data.data.data);
                        window.location.href = url;
                    } else {
                        setState(prev => ({ ...prev, joiningMeeting: false }));
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        });
                    }
                } else {
                    setState(prev => ({ ...prev, joiningMeeting: false }));
                    Toast.fire({
                        icon: 'warning',
                        title: "Something went wrong. Please try again!"
                    });
                }
            } else {
                setState(prev => ({ ...prev, joiningMeeting: false }));
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again!"
                });
            }
        });
    };

    const updateSelectedLanguage = (eventUserData) => {
        if (eventUserData !== "" && eventUserData !== undefined) {
            let params = {
                user_id: eventUserData._id,
                language: eventData.user_selected_language,
            };

            try {
                apiEventService.updateSelectedLanguage(params).then((data) => {
                    if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200
                        && data.data && data.data !== undefined && data.data !== null && data.data !== "" && data.data.status && data.data.status !== undefined && data.data.status !== null && data.data.status === "success") {
                        Toast.fire({
                            icon: 'success',
                            title: "Updated Language Successfully"
                        });
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        });
                    }
                });
            } catch (error) {
                Toast.fire({
                    icon: 'warning',
                    title: "Something went wrong. Please try again!"
                });
            }
        }
    };

    const showMeetingInfo = (event) => {
        setState(prev => ({ ...prev, eventInfo: event }));
        toggleInfoModal();
    };

    const toggleInfoModal = () => {
        setState(prev => ({ ...prev, isModalOpen: !prev.isModalOpen }));
    };

    const exportsUserStreamRecords = () => {
        setState(prev => ({ ...prev, exportingStreamReport: true }));

        let fileName = "StreamReport.pdf";
        let pdfOptions = {
            orientation: 'l',
            putOnlyUsedFonts: true
        };
        const doc = new jsPDF(pdfOptions);
        const marginLeft = 15;

        var img = new Image();
        img.src = REACT_APP_URL + "logo-2-01.png";
        doc.addImage(img, 'png', 100, 10, 110, 40);

        const data = state.exportUserStreamReports.map(elt => [elt.name, elt.email, elt.role, elt.start_time, elt.end_time, elt.duration]);

        var userStreamDatas = state.exportUserStreamReports;
        let moderatorCount = 0;
        let speakerCount = 0;
        let listenerCount = 0;
        let interpreterCount = 0;

        if (userStreamDatas !== undefined && userStreamDatas !== null && userStreamDatas !== "" && userStreamDatas.length > 0) {
            let moderators = userStreamDatas.filter(userStreamData => (userStreamData.role === "Moderator"));
            let speakers = userStreamDatas.filter(userStreamData => (userStreamData.role === "Speaker"));
            let listeners = userStreamDatas.filter(userStreamData => (userStreamData.role === "Listener"));
            let interpreters = userStreamDatas.filter(userStreamData => (userStreamData.role === "Interpreter"));
            moderatorCount = moderators.length;
            speakerCount = speakers.length;
            listenerCount = listeners.length;
            interpreterCount = interpreters.length;
        }

        if (state.fetchedEventDetails !== undefined && state.fetchedEventDetails !== null && state.fetchedEventDetails !== "") {
            let eventName = state.fetchedEventDetails.name;
            let eventCode = state.fetchedEventDetails.event_code;
            let eventStartTime = moment(state.fetchedEventDetails.start_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a');
            let eventEndTime = moment(state.fetchedEventDetails.end_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a');

            doc.setFontSize(11);
            doc.setFont(undefined, "normal", "bold");
            doc.text("Name:", marginLeft, 50);
            doc.setFont(undefined, "italic", "normal");
            doc.text(eventName, 30, 50);
            doc.setFont(undefined, "normal", "bold");
            doc.text("Code:", marginLeft, 60);
            doc.setFont(undefined, "italic", "normal");
            doc.text(eventCode, 30, 60);
            doc.setFont(undefined, "normal", "bold");
            doc.text("Time:", marginLeft, 70);
            doc.setFont(undefined, "italic", "normal");
            doc.text(eventStartTime + " - " + eventEndTime, 30, 70);
            doc.setFont(undefined, "normal", "normal");
        }

        doc.setFontSize(20);
        doc.text("Moderators: " + moderatorCount, marginLeft, 85);
        doc.text("Speakers: " + speakerCount, 100, 85);
        doc.text("Interpreters: " + interpreterCount, marginLeft, 95);
        doc.text("Listeners: " + listenerCount, 100, 95);

        doc.autoTable({
            startY: 105,
            head: [['User', 'Email', 'Role', 'Start Time', 'End Time', 'Duration']],
            body: data
        });

        doc.save(fileName);
        setState(prev => ({ ...prev, exportingStreamReport: false }));
    };

    const generateExcelExportData = (exportUserStreamReports) => {
        var userStreamDatas = exportUserStreamReports;
        let moderatorCount = 0;
        let speakerCount = 0;
        let listenerCount = 0;
        let interpreterCount = 0;

        if (userStreamDatas !== undefined && userStreamDatas !== null && userStreamDatas !== "" && userStreamDatas.length > 0) {
            let moderators = userStreamDatas.filter(userStreamData => (userStreamData.role === "Moderator"));
            let speakers = userStreamDatas.filter(userStreamData => (userStreamData.role === "Speaker"));
            let listeners = userStreamDatas.filter(userStreamData => (userStreamData.role === "Listener"));
            let interpreters = userStreamDatas.filter(userStreamData => (userStreamData.role === "Interpreter"));
            moderatorCount = moderators.length;
            speakerCount = speakers.length;
            listenerCount = listeners.length;
            interpreterCount = interpreters.length;
        }

        let eventName = state.fetchedEventDetails.name;
        let eventCode = state.fetchedEventDetails.event_code;
        let eventStartTime = moment(state.fetchedEventDetails.start_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a');
        let eventEndTime = moment(state.fetchedEventDetails.end_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a');

        let data = exportUserStreamReports.map(elt => [elt.name, elt.email, elt.role, elt.start_time, elt.end_time, elt.duration]);
        if (exportUserStreamReports.length === 0) {
            data.unshift(['', '', 'No Reports Found', '', '', '']);
        }
        data.unshift(['User', 'Email', 'Role', 'Start Time', 'End Time', 'Duration']);
        data.unshift(['', '', '', '', '', '']);
        data.unshift(['', '', '', '', '', '']);
        data.unshift(['Listeners : ' + listenerCount, 'Interpreters : ' + interpreterCount, '', '', '', '']);
        data.unshift(['Moderators : ' + moderatorCount, 'Speakers : ' + speakerCount, '', '', '', '']);
        data.unshift(['Time: ' + eventStartTime + ' to ' + eventEndTime, '', '', '', '', '']);
        data.unshift(['Code: ' + eventCode, '', '', '', '', '']);
        data.unshift(['Name: ' + eventName, '', '', '', '', '']);

        setState(prev => ({ ...prev, csvStreamRecordData: data }));
    };

    const exportsPollsRecords = () => {
        setState(prev => ({ ...prev, exportingPollReport: true }));

        document.getElementById("exportPollsRecordsTopDiv").style.marginTop = "1000px";

        var pollQuestionDiv = document.getElementsByClassName('polls-ques-whole-blk')[0];
        pollQuestionDiv.classList.add("hidescroll");

        var exportPollsRecords = document.getElementById("exportPollsRecords");
        exportPollsRecords.hidden = false;

        const OPTIONS = {
            'jsPDF': {
                'orientation': 'p',
                'unit': 'px',
                'format': 'a4',
                'putOnlyUsedFonts': false,
                'compress': false,
                'precision': 2,
                'userUnit': 1.0,
            },
            'html2canvas': {
                'allowTaint': false,
                'backgroundColor': '#ffffff',
                'canvas': null,
                'foreignObjectRendering': false,
                'imageTimeout': 15000,
                'logging': false,
                'onclone': null,
                'proxy': null,
                'removeContainer': true,
                'scale': window.devicePixelRatio,
                'useCORS': false,
            },
        };

        let totalHeight = exportPollsRecords.offsetHeight;
        const pdf = new jsPDF(OPTIONS.jsPDF.orientation, OPTIONS.jsPDF.unit, OPTIONS.jsPDF.format);
        const pdfWidth = pdf.internal.pageSize.width;
        const pdfHeight = pdf.internal.pageSize.height;

        html2canvas(exportPollsRecords, OPTIONS.html2canvas).then((canvas) => {
            document.getElementById("exportPollsRecordsTopDiv").style.marginTop = "0px";
            pollQuestionDiv.classList.remove("hidescroll");
            exportPollsRecords.hidden = true;
            const widthRatio = pdfWidth / canvas.width;
            const sX = 0;
            let sWidth = canvas.width;
            let sHeight = pdfHeight + ((pdfHeight - pdfHeight * widthRatio) / widthRatio);
            const dX = 0;
            const dY = 0;
            const dWidth = sWidth;
            const dHeight = sHeight;
            let pageCnt = 1;

            while (totalHeight > 0) {
                totalHeight -= sHeight;
                let sY = sHeight * (pageCnt - 1);
                const childCanvas = document.createElement('CANVAS');
                childCanvas.setAttribute('width', sWidth);
                childCanvas.setAttribute('height', sHeight);
                const childCanvasCtx = childCanvas.getContext('2d');
                childCanvasCtx.drawImage(canvas, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
                if (pageCnt > 1) {
                    pdf.addPage();
                }
                pdf.setPage(pageCnt);
                pdf.addImage(childCanvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width * widthRatio, 0);
                pageCnt++;
            }
            let fileName = 'pollsReport.pdf';
            pdf.save(fileName);
            setState(prev => ({ ...prev, exportingPollReport: false }));
        });
    };

    const filterBasedOnDate = (e) => {
        setState(prev => ({ ...prev, selectedDateFilter: e }));
        setTimeout(() => {
            onProcesUserStreamReport(state.originalStreamReport);
        }, 0);
    };

    const setDateCheckBox = (value) => {
        setState(prev => ({ ...prev, dateFilterActive: value }));
        setTimeout(() => {
            onProcesUserStreamReport(state.originalStreamReport);
        }, 0);
    };

    // Effect for component initialization
    useEffect(() => {
        const getUser = async () => {
            if (localStorage.getItem('eventCodeUser') !== null && localStorage.getItem('eventCodeUser') !== "") {
                setTimeout(() => {
                    setState(prev => ({ ...prev, apiresponse: true }));
                }, 1000);

                // let eventDetails = jwt.decode(localStorage.getItem('eventCodeUser'), REACT_APP_JWT_SECRET, 'HS512');
                let eventDetails = await helper.decodeEncodedItem(localStorage.getItem('eventCodeUser'))
                if (eventDetails.eventDetails !== undefined && eventDetails.eventDetails !== "") {
                    const eventDataTemp = eventDetails.eventDetails[0];

                    let dt1 = new Date(eventDataTemp.start_time);
                    let dt2 = new Date(eventDataTemp.end_time);

                    let updatedEventStartTime;
                    if (eventDataTemp.start_date_time !== undefined && eventDataTemp.start_date_time !== null && eventDataTemp.start_date_time !== "") {
                        updatedEventStartTime = moment(eventDataTemp.start_date_time).tz(state.timezone).format();
                    } else {
                        updatedEventStartTime = moment(eventDataTemp.date).tz(state.timezone).format();
                    }

                    updatedEventStartTime = new Date(updatedEventStartTime).setHours(addZero(new Date(eventDataTemp.start_time).getHours()));
                    updatedEventStartTime = new Date(updatedEventStartTime).setMinutes(addZero(new Date(eventDataTemp.start_time).getMinutes()));
                    updatedEventStartTime = new Date(updatedEventStartTime).setSeconds(addZero(new Date(eventDataTemp.start_time).getSeconds()));
                    updatedEventStartTime = new Date(updatedEventStartTime);

                    let updatedEventEndTime = new Date(updatedEventStartTime);
                    updatedEventEndTime.setMinutes(updatedEventEndTime.getMinutes() + diff_minutes(dt1, dt2));
                    updatedEventEndTime = moment(updatedEventEndTime).format('YYYY-MM-DD HH:mm:ss');

                    eventDataTemp.event_start_time = updatedEventStartTime;
                    eventDataTemp.event_end_time = updatedEventEndTime;
                    eventDataTemp.loggedin_user_id = eventDetails.loggedInUserId;

                    if (eventDetails.user_role === 'interpreter') {
                        setSessionDataDetails((eventDetails.sessionDetails !== undefined && eventDetails.sessionDetails !== null) ? eventDetails.sessionDetails : "");
                    }

                    eventDataTemp.user_role = eventDetails.user_role;
                    eventDataTemp.user_name = eventDetails.name;
                    eventDataTemp.user_email = eventDetails.mail;
                    eventDataTemp.eventId = eventDataTemp._id;
                    eventDataTemp.meetingCode = eventDetails.meetingCode;
                    eventDataTemp.user_selected_language = eventDetails.user_selected_language;

                    setEventData(eventDataTemp);

                    setState(prev => ({ ...prev, logoIMG: eventDetails.logo, moderator: false }));

                    if (eventDetails.user_role !== undefined && eventDetails.user_role !== "") {
                        if (eventDetails.user_role === 'moderator') {
                            setState(prev => ({ ...prev, moderator: true }));
                        }

                        if (eventDetails.user_role === 'interpreter') {
                            let getRoomDetails = {
                                session_id: eventDetails.sessionDetails
                            };
                            apiEventSessionService.getRoomDetails(getRoomDetails).then((data) => {
                                if (data && data !== undefined && data !== null && data !== "") {
                                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                        if (data.data.status && data.data.status === true && data.data.data && data.data.data.length > 0) {
                                            setState(prev => ({ ...prev, interpreterRoomDetails: data.data.data }));
                                        }
                                    }
                                }
                            });
                        }
                    }

                    sortEventList(eventDetails.eventDetails, true);

                    if (eventDetails.eventDetails.length > 0) {
                        const sectionMain = document.getElementById("section-main");
                        // if (document.getElementById("landingbg")) {
                        if (sectionMain) {
                            // replace backslash to forwardSlash
                            const lobbyUrl = (REACT_APP_API_IMAGE_URL + eventDetails.eventDetails[0].landing_page_bg)
                                .replace(/\\/g, "/");
                            sectionMain.style.backgroundImage = `url('${lobbyUrl}')`;
                            sectionMain.style.backgroundPosition = "center";
                            sectionMain.style.backgroundRepeat = " no-repeat";
                            sectionMain.style.backgroundSize = "cover";
                            sectionMain.style.margin = "0px";
                            sectionMain.style.borderRadius = "0px";
                            sectionMain.classList.add('landingbg');
                            sectionMain.classList.add('shadowtxt');
                        }
                    }
                }
            } else {
                setState(prev => ({ ...prev, moderator: true }));
                if (localStorage.getItem('userDetails') !== null && localStorage.getItem('userDetails') !== "") {
                    getEventDetails();
                } else {
                    history.push('/');
                }
            }
        }

        getUser()
    }, [getEventDetails, history, sortEventList, state.timezone]);

    return (
        <React.Fragment>
            <section className="scheduller-session !bg-white !h-screen !overflow-y-hidden" id="section-main">
            {
                    !state.apiresponse && (
                        <ApiLoader />
                    )
                }
                
                {/* <Header history={history} logoIMG={state.logoIMG} /> */}

                <div id="landingbg" className="d-flex !flex-col !bg-white !max-w-5xl !mx-auto !rounded-md shadow-md !before:bg-transparent !mt-16 p-5">
                    {/* logo  */}
                    <div className="!flex !items-center !justify-center">
                        <img src={state.logoIMG} alt="logo" className="!w-[13rem]" />
                    </div>

                    {
                        (state.eventAgenda.length == 0 && !state.loadingAgenda) && (
                            <div>
                                <div className="!flex !items-start !flex-col !justify-start !mt-5 p-4 !rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.1)] gap-4">
                                    <div className="flex flex-row items-center gap-2">
                                        <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Event: </h3>
                                        <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">{eventData['name']}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                        <div className="flex flex-col items-start gap-2">
                                            <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Start date & time </h3>
                                            <div className="flex flex-row items-center gap-4">
                                                <div className="flex flex-row items-start gap-2">
                                                    <span className="text-dark pt-1">
                                                        <LuClock size={20} />
                                                    </span>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                        {moment(eventData['event_start_time']).tz(state.timezone).format('hh:mm A')}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-row items-start gap-2">
                                                    <span className="text-dark pt-1">
                                                        <IoCalendarNumberOutline size={20} />
                                                    </span>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                        {moment(eventData['event_start_time']).tz(state.timezone).format('MMMM DD, YYYY')}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start gap-2">
                                            <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">End date & time </h3>
                                            <div className="flex flex-row items-center gap-4">
                                                <div className="flex flex-row items-start gap-2">
                                                    <span className="text-dark pt-1">
                                                        <LuClock size={20} />
                                                    </span>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                        {moment(eventData['event_end_time']).tz(state.timezone).format('hh:mm A')}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-row items-start gap-2">
                                                    <span className="text-dark pt-1">
                                                        <IoCalendarNumberOutline size={20} />
                                                    </span>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                        {moment(eventData['event_end_time']).tz(state.timezone).format('MMMM DD, YYYY')}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="!flex !items-start !flex-col !justify-start !mt-5 p-4 !rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.1)] gap-2">
                                    <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Description </h3>
                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">{eventData['description']}</h3>
                                </div>


                                {state.eventRooms.length > 0 ? (
                                    <div className="!flex !items-start !flex-col !justify-start p-4 !rounded-md gap-2 mt-5 w-full">
                                        <h1 className="!text-gray !font-montserrat !text-xl !font-semibold !shadow-none !mb-0 !text-shadow-none !border-none text-center w-full">All Rooms</h1>
                                        <div className="rooms-listing-whole-blk w-full">
                                            <div className="rooms-listing-wrapper !p-0 w-full">
                                                {state.eventRooms.map((room, key) => {
                                                    return (
                                                        <div className="!flex !items-start !justify-between p-2 !rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.1)] gap-2 border !border-gray-50 !rounded-md" key={key}>

                                                            <div className={"rooms-name-wrapper  !text-dark !font-montserrat !text-lg !font-normal !mb-0 !text-shadow-none !border-none room_list room_" + room._id + ""} >
                                                                {room.name}
                                                            </div>

                                                            <button onClick={() => viewAgenda(room._id, room.name, state.eventRooms.eventCode)} className=" !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none !border-none !rounded-3xl !bg-primary !text-white !px-4 !py-2">
                                                                Join Room
                                                            </button>
                                                        </div>

                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="!flex !items-start !flex-col !justify-start p-4 !rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.1)] gap-2 mt-5">
                                        <div className="!no-resourses-lst">
                                            <img src={NoDataIcon} alt="no-data" />
                                        </div>
                                        <div className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">No rooms are available</div>
                                    </div>
                                )}
                            </div>

                        )
                    }


                    {state.loadingAgenda && (
                        <div className="!flex !items-center !justify-center p-4 !rounded-md gap-2 mt-5">
                            <div className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none !mt-3 text-center">Fetching User Stream Reports. Please wait...</div>
                        </div>
                    )}

                    {state.eventAgenda.length > 0 && (
                        <div>
                            <div className="!text-dark !font-montserrat !text-2xl !font-semibold !mb-0 !text-shadow-none text-center mt-5">Sessions</div>
                            {state.eventAgenda.map((agendas, index) => {
                                return (
                                    <div className="agenda-block !border-none" key={index}>
                                        <div className="!flex !items-start !flex-col !justify-start p-4 !rounded-md shadow-[0_-4px_4px_rgba(0,0,0,0.1),0_4px_4px_rgba(0,0,0,0.1)] gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">

                                                <div className="flex flex-row items-center gap-2">
                                                    <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Agenda: </h3>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">{agendas?.name}</h3>
                                                </div>

                                                <div className="flex flex-row items-center gap-2">
                                                    <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Meeting ID: </h3>
                                                    <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">{state.eventCode}</h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                                                <div className="flex flex-col items-start gap-2">
                                                    <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Start date & time </h3>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className="flex flex-row items-start gap-2">
                                                            <span className="text-dark pt-1">
                                                                <LuClock size={20} />
                                                            </span>
                                                            <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                                {moment(agendas?.session_start_time).tz(state.timezone).format('hh:mm A')}
                                                            </h3>
                                                        </div>
                                                        <div className="flex flex-row items-start gap-2">
                                                            <span className="text-dark pt-1">
                                                                <IoCalendarNumberOutline size={20} />
                                                            </span>
                                                            <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                                {moment(agendas?.session_start_time).tz(state.timezone).format('MMMM DD, YYYY')}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start gap-2">
                                                    <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">End date & time </h3>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className="flex flex-row items-start gap-2">
                                                            <span className="text-dark pt-1">
                                                                <LuClock size={20} />
                                                            </span>
                                                            <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                                {moment(agendas?.session_end_time).tz(state.timezone).format('hh:mm A')}
                                                            </h3>
                                                        </div>
                                                        <div className="flex flex-row items-start gap-2">
                                                            <span className="text-dark pt-1">
                                                                <IoCalendarNumberOutline size={20} />
                                                            </span>
                                                            <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">
                                                                {moment(agendas?.session_end_time).tz(state.timezone).format('MMMM DD, YYYY')}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        <div className="!flex !items-start !flex-col !justify-start !mt-5 p-4 !rounded-md shadow-[0_4px_4px_rgba(0,0,0,0.1)] gap-2">
                                            <h3 className="!text-gray !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">Description </h3>
                                            <h3 className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none">{agendas['description']}</h3>
                                        </div>

                                        {state.eventStatus !== "" && state.eventStatus !== 2 && (
                                            <div className="room-join-btn-wrapper !border-none !shadow-none">
                                                <button className="border border-gray text-dark !rounded-3xl !px-12 !py-2 !mr-4 !text-lg" onClick={() => setState(prev => ({ ...prev, eventAgenda: [] }))}>
                                                    Back
                                                </button>
                                                {agendas.type === "past" && (
                                                    <button type="button" className="!text-dark !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none px-4 py-2">This meeting already expired</button>
                                                )}
                                                {agendas.type !== "past" && (
                                                    state.joiningMeeting ? (
                                                        <button type="button" className="!rounded-3xl !bg-primary !text-white !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none px-4 py-2" disabled={state.joiningMeeting}>
                                                            {state.joiningMeeting === true ? state.moderator === true ? 'Starting Meeting... ' : 'Joining Meeting... ' : state.moderator === true ? 'Start Meeting' : 'Join Meeting'}
                                                            {state.joiningMeeting === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="!rounded-3xl !bg-primary !text-white !font-montserrat !text-lg !font-normal !shadow-none !mb-0 !text-shadow-none px-4 py-2" onClick={() => goForEvents(agendas)}>
                                                            {state.moderator === true ? 'Start Meeting' : 'Join Meeting'}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}



                    {/*                   
                    {eventData !== "" && (
                        <div className="meet-schedule-col mod-meet-lst-blk">
                            <div className="meet-schedul-caption meet-schedul-underline">{eventData['name']}</div>
                            <div className="meeting-listing-whole-blk">
                                <div className="meeting-lst-desc-wrap">
                                    <div className="rooms-lst-label">Event Start Time</div>
                                    <div className="meeting-event-desc">
                                        {moment(eventData['event_start_time']).tz(state.timezone).format('Do MMM YYYY, hh:mm a')}
                                    </div>
                                </div>

                                <div className="meeting-lst-desc-wrap">
                                    <div className="rooms-lst-label">Event End Time</div>
                                    <div className="meeting-event-desc">
                                        {moment(eventData['event_end_time']).tz(state.timezone).format('Do MMM YYYY, hh:mm a')}
                                    </div>
                                </div>

                                <div className="meeting-lst-desc-wrap">
                                    <div className="rooms-lst-label">Description</div>
                                    <div className="meeting-event-desc">
                                        {eventData['description']}
                                    </div>
                                </div>

                                {state.moderator === true && (
                                    <>
                                        <div className="meeting-link-desc">
                                            <div className="d-flex event-meet-link moderator-lk">Moderator :</div>
                                            <div className="d-flex align-items-center meeting-link-url-blk">
                                                <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_MODERATOR + eventData['event_code']}>
                                                    {REACT_APP_MEETING_LINK_MODERATOR + eventData['event_code']}
                                                </div>
                                                <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_MODERATOR + eventData['event_code'])}>
                                                    <img src={CopyURLImg} alt="copy url" />
                                                </div>
                                            </div>
                                        </div>

                                        {eventData['enableSecondaryModerator'] === true && (
                                            <div className="meeting-link-desc">
                                                <div className="d-flex event-meet-link moderator-lk">Secondary Moderator :</div>
                                                <div className="d-flex align-items-center meeting-link-url-blk">
                                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + eventData['event_code']}>
                                                        {REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + eventData['event_code']}
                                                    </div>
                                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + eventData['event_code'])}>
                                                        <img src={CopyURLImg} alt="copy url" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="meeting-link-desc">
                                            <div className="d-flex event-meet-link moderator-lk">Speaker :</div>
                                            <div className="d-flex align-items-center meeting-link-url-blk">
                                                <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SPEAKER + eventData['event_code']}>
                                                    {REACT_APP_MEETING_LINK_SPEAKER + eventData['event_code']}
                                                </div>
                                                <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SPEAKER + eventData['event_code'])}>
                                                    <img src={CopyURLImg} alt="copy url" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="meeting-link-desc">
                                            <div className="d-flex event-meet-link moderator-lk">Interpreter :</div>
                                            <div className="d-flex align-items-center meeting-link-url-blk">
                                                <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_INTERPRETER + eventData['event_code']}>
                                                    {REACT_APP_MEETING_LINK_INTERPRETER + eventData['event_code']}
                                                </div>
                                                <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_INTERPRETER + eventData['event_code'])}>
                                                    <img src={CopyURLImg} alt="copy url" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="meeting-link-desc">
                                            <div className="d-flex event-meet-link moderator-lk">Viewer :</div>
                                            <div className="d-flex align-items-center meeting-link-url-blk">
                                                <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_LEARNER + eventData['event_code']}>
                                                    {REACT_APP_MEETING_LINK_LEARNER + eventData['event_code']}
                                                </div>
                                                <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_LEARNER + eventData['event_code'])}>
                                                    <img src={CopyURLImg} alt="copy url" />
                                                </div>
                                            </div>
                                        </div>

                                        {eventData['streamOut'] !== undefined && eventData['streamOut'] !== null && eventData['streamOut'] === true && (
                                            <div className="meeting-link-desc">
                                                <div className="d-flex event-meet-link moderator-lk">Stream Out :</div>
                                                <div className="d-flex align-items-center meeting-link-url-blk">
                                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_STREAMOUT + eventData['event_code']}>
                                                        {REACT_APP_MEETING_LINK_STREAMOUT + eventData['event_code']}
                                                    </div>
                                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_STREAMOUT + eventData['event_code'])}>
                                                        <img src={CopyURLImg} alt="copy url" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {eventData['signLanguageMode'] !== undefined && eventData['signLanguageMode'] !== null && eventData['signLanguageMode'] === true && (
                                            <div className="meeting-link-desc">
                                                <div className="d-flex event-meet-link moderator-lk">Sign Language :</div>
                                                <div className="d-flex align-items-center meeting-link-url-blk">
                                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SIGNLANGUAGE + eventData['event_code']}>
                                                        {REACT_APP_MEETING_LINK_SIGNLANGUAGE + eventData['event_code']}
                                                    </div>
                                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SIGNLANGUAGE + eventData['event_code'])}>
                                                        <img src={CopyURLImg} alt="copy url" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )} */}
                    {/* 
                    {eventData === "" && (
                        <div className="meet-schedule-col mod-meet-lst-blk">
                            <div className="meet-schedul-caption meet-schedul-underline">Meetings</div>
                            <div className="meeting-whole-lst">
                                <div className="create-meet-lst">
                                    <button type="button" className="room-join-btn" onClick={() => createMeeting()}>
                                        <span className="room-join-plus">+</span>Create Meeting
                                    </button>
                                </div>

                                {state.fetchEvents && (
                                    <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                                        <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                                        <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Events. Please wait...</div>
                                    </div>
                                )}

                                {!state.fetchEvents && (
                                    <React.Fragment>
                                        {state.eventList !== "" && state.eventList.length > 0 ? (
                                            <div className="current-meet-blk">
                                                {state.currentEvents.length > 0 && (
                                                    <React.Fragment>
                                                        <Accordion defaultExpanded expanded={state.accordionPanel === 'panel1a'} onChange={handleAccordionChange('panel1a')}>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" className="current-meetings">
                                                                Current meetings
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <div className="meet-lst-wrapper">
                                                                    {state.currentEvents.map((event, key) => {
                                                                        return (
                                                                            <div className={"d-flex align-items-center justify-content-between meet-lst-container meeting_list meeting_" + event._id + ""} key={key}>
                                                                                <div className={"meeting-lst-title "} onClick={() => viewRooms(event._id, event.event_code, 1, event.repeatWeekly, true)} title={event.name}>
                                                                                    {event.name}
                                                                                </div>
                                                                                <div className="meeting-info-icon" onClick={() => showMeetingInfo(event)}>
                                                                                    <img src={InfoIcon} alt="info" />
                                                                                </div>
                                                                                <div className="meeting-lst-edit-wrapper" onClick={() => editEvent(event._id)}>
                                                                                    <img src={EditIcon} alt="edit" />
                                                                                </div>
                                                                                <div className="meeting-lst-delete-wrapper" onClick={() => deleteEvent(event._id, key, "current")}>
                                                                                    <img src={TrashIcon} alt="delete" />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </React.Fragment>
                                                )}

                                                {state.pastEvents.length > 0 && (
                                                    <React.Fragment>
                                                        <Accordion expanded={state.accordionPanel === 'panel2a'} onChange={handleAccordionChange('panel2a')}>
                                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header" className="past-meetings">
                                                                Past meetings
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                <div className="meet-lst-wrapper">
                                                                    {state.pastEvents.map((event, key) => {
                                                                        let archives = (event.archives !== undefined && event.archives !== null && event.archives !== "" && event.archives.length > 0) ? event.archives : (event.archive !== undefined && event.archive !== null && event.archive !== "" && event.archive.length > 0) ? event.archive : [];
                                                                        return (
                                                                            <div className={"d-flex align-items-center justify-content-between meet-lst-container meeting_list meeting_" + event._id + ""} key={key}>
                                                                                <div className={"meeting-lst-title "} onClick={() => viewRooms(event._id, event.event_code, 0, event.repeatWeekly, true, archives)} title={event.name}>
                                                                                    {event.name}
                                                                                </div>
                                                                                <div className="meeting-info-icon">
                                                                                    <img src={InfoIcon} alt="info" onClick={() => showMeetingInfo(event)} />
                                                                                </div>
                                                                                <div className="meeting-lst-edit-wrapper" onClick={() => editEvent(event._id)}>
                                                                                    <img src={EditIcon} alt="edit" />
                                                                                </div>
                                                                                <div className="meeting-lst-delete-wrapper" onClick={() => deleteEvent(event._id, key, "past")}>
                                                                                    <img src={TrashIcon} alt="delete" />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    </React.Fragment>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ "marginTop": "50px" }} className="d-flex align-items-center justify-content-center flex-column h-100">
                                                <div className="no-resourses-lst">
                                                    <img src={NoDataIcon} alt="no-data" />
                                                </div>
                                                <div className="empty-list-txt">No Meetings are available</div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    )} */}

                    {/* <div className="rooms-listing-tab">
                        {state.fetchRooms && (
                            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Rooms. Please wait...</div>
                            </div>
                        )}

                        {!state.fetchRooms && (
                            <React.Fragment>
                                {state.eventRooms.length > 0 ? (
                                    <>
                                        <div className="rooms-listing-caption meet-schedul-underline">rooms</div>
                                        <div className="rooms-listing-whole-blk">
                                            <div className="rooms-listing-wrapper">
                                                {state.eventRooms.map((room, key) => {
                                                    return (
                                                        <div className={"rooms-name-wrapper room_list room_" + room._id + ""} key={key} onClick={() => viewAgenda(room._id, room.name, state.eventRooms.eventCode)}>
                                                            {room.name}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                                        <div className="no-resourses-lst">
                                            <img src={NoDataIcon} alt="no-data" />
                                        </div>
                                        <div className="empty-list-txt">No rooms are available</div>
                                    </div>
                                )}
                            </React.Fragment>
                        )}

                        {state.allowUserReportDisplay && (
                            <div className="duration-statistics" onClick={() => viewUserReport()}>Duration Statistics</div>
                        )}

                        {state.allowUserReportDisplay && (
                            <div className="view-recordings-caption" onClick={() => viewRecordings()}>View Recordings</div>
                        )}

                        {state.pollsList !== undefined && state.pollsList !== null && state.pollsList !== "" && state.pollsList.length > 0 && (
                            <React.Fragment>
                                <div className="polls-lst-caption">Polls</div>
                                <div className="polls-lst-whole-blk">
                                    <div className="polls-lst-wrapper">
                                        {state.pollsList.map((poll, index) => {
                                            return (
                                                <div className={"polls-name-wrapper poll_list poll_" + poll._id + ""} key={"polls_" + index} onClick={() => viewPollReport(poll._id, state.pollsList['event_id'], poll.title)}>
                                                    {poll.title}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </div> */}
                    {/* 
                    <div className="rooms-listing-col">
                        {state.fetchSessions && state.showSessions && (
                            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Sessions. Please wait...</div>
                            </div>
                        )}

                        {!state.fetchSessions && state.showSessions && (
                            <React.Fragment>
                                {state.eventAgenda.length > 0 ? (
                                    <React.Fragment>
                                        <div className="rooms-listing-caption">Sessions</div>
                                        {state.eventAgenda.map((agendas, index) => {
                                            return (
                                                <div className="agenda-block" key={index}>
                                                    <div className="rooms-list-name-caption">{agendas.name}</div>
                                                    <div className="rooms-lst-col-desc">
                                                        <div className="rooms-lst-label">Description</div>
                                                        <div className="rooms-lst-event-desc">
                                                            {agendas.description}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex rooms-lst-col-desc">
                                                        <div className="room-assign-start-time">
                                                            <div className="rooms-lst-label">Start Time</div>
                                                            <div className="rooms-lst-val">
                                                                {moment(agendas.session_start_time).format('Do MMM YYYY, hh:mm a')}
                                                            </div>
                                                        </div>
                                                        <div className="room-assign-end-time">
                                                            <div className="rooms-lst-label">End Time</div>
                                                            <div className="rooms-lst-val">
                                                                {moment(agendas.session_end_time).format('Do MMM YYYY, hh:mm a')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="rooms-lst-col-desc">
                                                        <div className="room-meet-id">Meeting ID:<span>{state.eventCode}</span></div>
                                                    </div>
                                                    {state.eventStatus !== "" && state.eventStatus !== 2 && (
                                                        <div className="room-join-btn-wrapper">
                                                            {agendas.type === "past" && (
                                                                <button type="button" className="view-room-meet-btn">This meeting already expired</button>
                                                            )}
                                                            {agendas.type !== "past" && (
                                                                state.joiningMeeting ? (
                                                                    <button type="button" className="view-room-meet-btn" disabled={state.joiningMeeting}>
                                                                        {state.joiningMeeting === true ? state.moderator === true ? 'Starting Meeting... ' : 'Joining Meeting... ' : state.moderator === true ? 'Start Meeting' : 'Join Meeting'}
                                                                        {state.joiningMeeting === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                                                    </button>
                                                                ) : (
                                                                    <button type="button" className="view-room-meet-btn" onClick={() => goForEvents(agendas)}>
                                                                        {state.moderator === true ? 'Start Meeting' : 'Join Meeting'}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                                        <div className="no-resourses-lst">
                                            <img src={NoDataIcon} alt="no-data" />
                                        </div>
                                        <div className="empty-list-txt">No agenda available</div>
                                    </div>
                                )}
                            </React.Fragment>
                        )}

                        {state.fetchPollReport && state.showPollReports && (
                            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching Poll Reports. Please wait...</div>
                            </div>
                        )}

                        {!state.fetchPollReport && state.showPollReports && (
                            <React.Fragment>
                                {state.pollreports.length > 0 ? (
                                    <React.Fragment>
                                        <div className="question-head">
                                            <div className="rooms-list-name-caption">Questions</div>
                                            {state.exportingPollReport ? (
                                                <button type="button" className="room-join-btn" disabled={state.exportingPollReport}>
                                                    {state.exportingPollReport === true ? 'Exporting...' : 'Export'}
                                                    {state.exportingPollReport === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                                </button>
                                            ) : (
                                                <button className="room-join-btn" onClick={() => exportsPollsRecords()}>Export</button>
                                            )}
                                        </div>
                                        <div className="polls-ques-whole-blk">
                                            {state.pollreports.map((pollreport, index) => {
                                                var options = pollreport.options;
                                                var optionPercentage = pollreport.report;
                                                var optionResponses = pollreport.responses;

                                                return (
                                                    <React.Fragment key={"pollreport_" + index}>
                                                        <div className="polls-ques-container">
                                                            <div className="polls-ques-part"><span>{index + 1}.</span>{pollreport.question}</div>
                                                            <div className="polls-response-blk">
                                                                {options.map((option, key) => {
                                                                    let updatedPercentage = 0;
                                                                    let updatedTotalResponse = 0;

                                                                    try {
                                                                        let percentage = optionPercentage.filter(percentage => (Object.keys(percentage)[0] === Object.keys(option)[0]));
                                                                        if (percentage !== undefined && percentage !== null && percentage !== "" && percentage.length > 0 && Object.values(percentage[0])[0] !== undefined && Object.values(percentage[0])[0] !== null && Object.values(percentage[0])[0] !== "") {
                                                                            updatedPercentage = Object.values(percentage[0])[0];
                                                                        }
                                                                    } catch (e) { }

                                                                    try {
                                                                        let responses = optionResponses.filter(response => (response.answer === Object.keys(option)[0]));
                                                                        if (responses !== undefined && responses !== null && responses !== "" && responses.length > 0) {
                                                                            updatedTotalResponse = responses.length;
                                                                        }
                                                                    } catch (e) { }

                                                                    return (
                                                                        <div className="d-flex align-items-center poll-response-container" key={"optionvalues_" + key}>
                                                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                                                <div className="d-flex align-items-center polls-choice-ans">
                                                                                    <div className="polls-choice">{Object.keys(option)[0].toUpperCase()}.</div>
                                                                                    <div className="polls-ans">{Object.values(option)[0]}</div>
                                                                                </div>
                                                                                <div className="d-flex align-items-center polls-ans-right-blk">
                                                                                    <div className="d-flex align-items-center polls-attendees-count">{updatedTotalResponse}</div>
                                                                                    <div className="polls-percentage">{format_poll_percentage(updatedPercentage)}%</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="polls-progress-indicator-color" style={{ "width": updatedPercentage + "%" }}></div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}

                                            <div id="exportPollsRecordsTopDiv">
                                                <div id="exportPollsRecords" hidden>
                                                    <div className="Even_Details">
                                                        <div className="logo">
                                                            <img alt="logo" src={LogoIcon} />
                                                        </div>
                                                        {state.fetchedEventDetails !== "" && state.fetchedEventDetails !== 'undefined' && (
                                                            <>
                                                                <div className="eventDetails">
                                                                    <div className="eventName d-flex mb-3"> Name : {state.fetchedEventDetails.name} </div>
                                                                    <div className="eventDescription d-flex mb-3"> Description : {state.fetchedEventDetails.description} </div>
                                                                    <div className="eventStartTime d-flex mb-3">Start Time : {moment(state.fetchedEventDetails.start_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a')} </div>
                                                                    <div className="eventEndTime d-flex mb-3">End Time : {moment(state.fetchedEventDetails.end_time).tz(state.timezone).format('Do MMM YYYY, hh:mm a')} </div>
                                                                    <div className="pollTitle d-flex mb-3">Poll Name : {state.fetchedEventDetails.poll_title}</div>
                                                                </div>
                                                                <div className="pollTitle">Questions</div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="">
                                                        {state.pollreports.map((pollreport, index) => {
                                                            var options = pollreport.options;
                                                            var optionPercentage = pollreport.report;
                                                            var optionResponses = pollreport.responses;

                                                            return (
                                                                <React.Fragment key={"pollreport_" + index}>
                                                                    <div className="polls-ques-container">
                                                                        <div className="polls-ques-part"><span>{index + 1}.</span>{pollreport.question}</div>
                                                                        <div className="polls-response-blk">
                                                                            {options.map((option, key) => {
                                                                                let updatedPercentage = 0;
                                                                                let updatedTotalResponse = 0;

                                                                                try {
                                                                                    let percentage = optionPercentage.filter(percentage => (Object.keys(percentage)[0] === Object.keys(option)[0]));
                                                                                    if (percentage !== undefined && percentage !== null && percentage !== "" && percentage.length > 0 && Object.values(percentage[0])[0] !== undefined && Object.values(percentage[0])[0] !== null && Object.values(percentage[0])[0] !== "") {
                                                                                        updatedPercentage = Object.values(percentage[0])[0];
                                                                                    }
                                                                                } catch (e) { }

                                                                                try {
                                                                                    let responses = optionResponses.filter(response => (response.answer === Object.keys(option)[0]));
                                                                                    if (responses !== undefined && responses !== null && responses !== "" && responses.length > 0) {
                                                                                        updatedTotalResponse = responses.length;
                                                                                    }
                                                                                } catch (e) { }

                                                                                return (
                                                                                    <div className="d-flex align-items-center poll-response-container" key={"optionvalues_" + key}>
                                                                                        <div className="d-flex align-items-center justify-content-between w-100">
                                                                                            <div className="d-flex align-items-center polls-choice-ans">
                                                                                                <div className="polls-choice">{Object.keys(option)[0].toUpperCase()}.&nbsp;</div>
                                                                                                <div className="polls-ans1">{Object.values(option)[0]}</div>
                                                                                            </div>
                                                                                            <div className="d-flex align-items-center polls-ans-right-blk">
                                                                                                <div className="d-flex align-items-center polls-attendees-count">{updatedTotalResponse}</div>
                                                                                                <div className="polls-percentage">{format_poll_percentage(updatedPercentage)}%</div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="polls-progress-indicator-color" style={{ "width": updatedPercentage + "%" }}></div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                                        <div className="no-resourses-lst">
                                            <img src={NoDataIcon} alt="no-data" />
                                        </div>
                                        <div className="empty-list-txt">No poll questions available</div>
                                    </div>
                                )}
                            </React.Fragment>
                        )}

                        {state.fetchUserReport && state.showEventUserStreamReport && (
                            <div className="d-flex align-items-center justify-content-center h-100 flex-column">
                                <Loader type="Bars" color="#00d2a5" height={30} width={30} />
                                <div className="mt-3" style={{ "fontSize": "13px", "color": "#a9a9a9" }}>Fetching User Stream Reports. Please wait...</div>
                            </div>
                        )}

                        {!state.fetchUserReport && state.showEventUserStreamReport && (
                            <React.Fragment>
                                {state.userstreamreports.length > 0 || true ? (
                                    <React.Fragment>
                                        <div className="rooms-list-name-caption">Streaming Duration</div>
                                        <br />
                                        <div className="question-head">
                                            <div className="pickerlabal">Filter Report By Date</div>
                                            <input type="checkbox"
                                                name="datepickerneeded"
                                                value={state.dateFilterActive}
                                                checked={state.dateFilterActive === true ? "checked" : ""}
                                                onChange={() => { setDateCheckBox(!state.dateFilterActive); }} />
                                            <div className={state.dateFilterActive ? "" : "hide"}>
                                                <DatePicker
                                                    selected={state.selectedDateFilter}
                                                    onChange={(e) => {
                                                        filterBasedOnDate(e);
                                                    }}
                                                    onChangeRaw={(e) => { e.preventDefault() }}
                                                    className="custom-date"
                                                    timeIntervals={10}
                                                    dateFormat="MMMM d, yyyy "
                                                    timeCaption="time"
                                                    placeholderText="Select date "
                                                />
                                            </div>

                                            {state.exportingStreamReport ? (
                                                <button type="button" className="room-join-btn" disabled={state.exportingStreamReport}>
                                                    {state.exportingStreamReport === true ? 'Exporting...' : 'Export'}
                                                    {state.exportingStreamReport === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                                </button>
                                            ) : (
                                                <div>
                                                    <button className="room-join-btn" onClick={() => { exportsUserStreamRecords() }}>Export Pdf</button>
                                                    <button className="room-join-btn csvbtn">
                                                        <a target="_blank" href={REACT_APP_API_URL + 'event/downloadUserStreamReport/' + state.fetchEventId} rel="noopener noreferrer">Export Excel</a>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="duration-statistics-tbl">
                                            <div className="grid-table-row statistics-tbl-row grid-table-shadow">
                                                <div className="grid-table-head">
                                                    <div className="d-flex align-items-center">User</div>
                                                </div>
                                                <div className="grid-table-head">
                                                    <div className="d-flex align-items-center justify-content-center">User Role</div>
                                                </div>
                                                <div className="grid-table-head">
                                                    <div className="d-flex align-items-center justify-content-center">Duration</div>
                                                </div>
                                            </div>
                                            <div className="duration-tbl-data-wrapper ">
                                                <div className={state.userstreamreports.length > 0 ? "hide" : "d-flex align-items-center justify-content-center flex-column h-100"}>
                                                    <div className="no-resourses-lst">
                                                        <img src={NoDataIcon} alt="no-data" />
                                                    </div>
                                                    <div className="empty-list-txt">No reports available</div>
                                                </div>
                                                {state.userstreamreports.map((userreport, index) => {
                                                    let startTime = (userreport.start_time !== undefined && userreport.start_time !== null && userreport.start_time !== "") ? userreport.start_time : "";
                                                    let endTime = (userreport.end_time !== undefined && userreport.end_time !== null && userreport.end_time !== "") ? userreport.end_time : "";

                                                    let streamedDuration = 0;

                                                    if (startTime !== "" && endTime !== "") {
                                                        let dt1 = new Date(startTime);
                                                        let dt2 = new Date(endTime);
                                                        streamedDuration = Math.abs(dt1 - dt2) / 1000;
                                                    }

                                                    return (
                                                        <div className="grid-td grid-table-row" key={"userreport_" + index}>
                                                            <div className="grid-table-data">
                                                                <div className="grid-table-user">{userreport.name}</div>
                                                            </div>
                                                            <div className="grid-table-data">
                                                                <div className="grid-table-user d-flex justify-content-center">{userreport.role[0].toUpperCase() + userreport.role.slice(1)}</div>
                                                            </div>
                                                            <div className="grid-table-data">
                                                                <div className="grid-table-user d-flex justify-content-center">{timeConvert(streamedDuration)}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                                        <div className="no-resourses-lst">
                                            <img src={NoDataIcon} alt="no-data" />
                                        </div>
                                        <div className="empty-list-txt">No reports available</div>
                                    </div>
                                )}
                            </React.Fragment>
                        )}

                        {state.showEventRecordings && (
                            <React.Fragment>
                                <div className="rooms-list-name-caption">All Recordings</div>
                                <div className="recordings-wrapper">
                                    {state.archives && state.archives.length > 0 ? (
                                        state.archives.map((archive, index) => {
                                            let downloadLink = REACT_APP_S3_UPLOADS_URL + REACT_APP_OPENTOK_KEY + "/" + archive.id + "/archive.zip";
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
                                                <img src={NoDataIcon} alt="no-data" />
                                            </div>
                                            <div className="empty-list-txt">No recordings available</div>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        )}
                    </div> */}
                </div>
            </section>

            <Modal isOpen={state.isModalOpen} fade={true} centered className={'info-modal-dialog'}>
                <div className="d-flex justify-content-end popup-close-btn" onClick={() => toggleInfoModal()}>
                    &times;
                </div>
                <div className="popup-info-icon-wrapper">
                    <img src={InformationIcon} alt="info" />
                </div>
                {state.eventInfo !== "" && (
                    <div className="popup-info-desc">
                        <div className="meet-schedul-caption meet-schedul-underline">{state.eventInfo.name}</div>
                        <div className="meeting-listing-whole-blk">
                            {state.eventInfo.description !== "" && (
                                <div className="meeting-lst-desc-wrap">
                                    <div className="rooms-lst-label">Description</div>
                                    <div className="meeting-event-desc">
                                        {state.eventInfo.description}
                                    </div>
                                </div>
                            )}
                            <div className="meeting-link-desc ">
                                <div className="d-flex event-meet-link moderator-lk">Moderator :</div>
                                <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_MODERATOR + state.eventInfo.event_code}>
                                        {REACT_APP_MEETING_LINK_MODERATOR + state.eventInfo.event_code}
                                    </div>
                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_MODERATOR + state.eventInfo.event_code)}>
                                        <img src={CopyURLImg} alt="copy url" />
                                    </div>
                                </div>
                            </div>

                            {state.eventInfo.enableSecondaryModerator === true && (
                                <div className="meeting-link-desc ">
                                    <div className="d-flex event-meet-link moderator-lk">Secondary Moderator :</div>
                                    <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                        <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + state.eventInfo.event_code}>
                                            {REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + state.eventInfo.event_code}
                                        </div>
                                        <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SECONDARY_MODERATOR + state.eventInfo.event_code)}>
                                            <img src={CopyURLImg} alt="copy url" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="meeting-link-desc ">
                                <div className="d-flex event-meet-link moderator-lk">Speaker :</div>
                                <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SPEAKER + state.eventInfo.event_code}>
                                        {REACT_APP_MEETING_LINK_SPEAKER + state.eventInfo.event_code}
                                    </div>
                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SPEAKER + state.eventInfo.event_code)}>
                                        <img src={CopyURLImg} alt="copy url" />
                                    </div>
                                </div>
                            </div>

                            <div className="meeting-link-desc">
                                <div className="d-flex event-meet-link moderator-lk">Interpreter :</div>
                                <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_INTERPRETER + state.eventInfo.event_code}>
                                        {REACT_APP_MEETING_LINK_INTERPRETER + state.eventInfo.event_code}
                                    </div>
                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_INTERPRETER + state.eventInfo.event_code)}>
                                        <img src={CopyURLImg} alt="copy url" />
                                    </div>
                                </div>
                            </div>

                            <div className="meeting-link-desc">
                                <div className="d-flex event-meet-link moderator-lk">Viewer :</div>
                                <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                    <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_LEARNER + state.eventInfo.event_code}>
                                        {REACT_APP_MEETING_LINK_LEARNER + state.eventInfo.event_code}
                                    </div>
                                    <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_LEARNER + state.eventInfo.event_code)}>
                                        <img src={CopyURLImg} alt="copy url" />
                                    </div>
                                </div>
                            </div>

                            {state.eventInfo.streamOut !== undefined && state.eventInfo.streamOut !== null && state.eventInfo.streamOut === true && (
                                <div className="meeting-link-desc">
                                    <div className="d-flex event-meet-link moderator-lk">Stream Out :</div>
                                    <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                        <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_STREAMOUT + state.eventInfo.event_code}>
                                            {REACT_APP_MEETING_LINK_STREAMOUT + state.eventInfo.event_code}
                                        </div>
                                        <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_STREAMOUT + state.eventInfo.event_code)}>
                                            <img src={CopyURLImg} alt="copy url" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {state.eventInfo.signLanguageMode !== undefined && state.eventInfo.signLanguageMode !== null && state.eventInfo.signLanguageMode === true && (
                                <div className="meeting-link-desc">
                                    <div className="d-flex event-meet-link moderator-lk">Sign Language Mode :</div>
                                    <div className="d-flex align-items-center meeting-link-url-blk info-link">
                                        <div className="meeting-link-url" title={REACT_APP_MEETING_LINK_SIGNLANGUAGE + state.eventInfo.event_code}>
                                            {REACT_APP_MEETING_LINK_SIGNLANGUAGE + state.eventInfo.event_code}
                                        </div>
                                        <div className="meet-link-url-copy" onClick={() => copyLink(REACT_APP_MEETING_LINK_SIGNLANGUAGE + state.eventInfo.event_code)}>
                                            <img src={CopyURLImg} alt="copy url" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </React.Fragment >
    );
};

export default ParticipantLobby;