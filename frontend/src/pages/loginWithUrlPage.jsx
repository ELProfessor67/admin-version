import React, { useState, useEffect, useRef } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import apiEventService from "@/service/event/eventService";
import helper from '@/utils/helper';
import api from "@/service/language/languageService";
import Select from "react-select";
// import logoIMAGEWITHTEXT from "@/assets/img/logo-2-01.png";
import logoIMAGEWITHTEXT from "@/assets/img/lingo-you-logo.svg";
import { Toast } from "@/components/toastComponent";
import { encodeToken } from "@/service/auth/authService";
import { REACT_APP_API_IMAGE_URL, REACT_APP_MEETINGCODE_LENGTH } from "@/constants/URLConstant";
import apiEventUserService from "@/service/event/eventUserService"
import { REACT_APP_API_URL } from "@/constants/URLConstant";
import ApiLoader from '@/components/Loader';
const LoginWithUrlPage = (props) => {
    const [eventList, setEventList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [coverImage, setCoverImage] = useState([]);
    const [logoImage, setLogoImage] = useState("");
    const [userRole, setUserRole] = useState("");
    const [meetingCode, setMeetingCode] = useState('');
    const [languageDetails, setLanguageDetails] = useState([{ value: "floor", label: "Original" }]);
    const [selectedOption, setSelectedOption] = useState({ value: "floor", label: "Original" });
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [speakerUsers, setSpeakerUsers] = useState([]);
    const [learnerUsers, setLearnerUsers] = useState([]);
    const [apiresponse, setApiresponse] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);

    const splittedURL = useRef(props.location.pathname.split("/"));
    const meetingCodeRef = useRef('');
    const speakersRef = useRef([]);
    const learnersRef = useRef([]);

    useEffect(() => {
        if (splittedURL.current[1] !== "" && splittedURL.current[1] !== undefined) {
            meetingCodeRef.current = splittedURL.current[1];
        }

        let userRoleValue = helper.getUserRole(meetingCodeRef.current.charAt(0));
        if (userRoleValue !== undefined && userRoleValue !== false) {
            setUserRole(userRoleValue);
            let meetingCodeValue = meetingCodeRef.current.substr(meetingCodeRef.current.length - REACT_APP_MEETINGCODE_LENGTH);
            if (meetingCodeValue !== undefined && meetingCodeValue.length === parseInt(REACT_APP_MEETINGCODE_LENGTH)) {
                setMeetingCode(meetingCodeValue);
                getEventByEventCode(meetingCodeValue);
            } else {
                setTimeout(() => {
                    setApiresponse(true);
                }, 1000);
            }
        } else {
            Toast.fire({
                icon: 'warning',
                title: "Not a valid meeting link."
            });
            setTimeout(() => {
                setApiresponse(true);
            }, 1000);
        }

        localStorage.removeItem("userDetails");
    }, []);

    const getEventByEventCode = (meetingCodeValue) => {
        if (meetingCodeValue && meetingCodeValue !== null &&
            meetingCodeValue !== "" && meetingCodeValue !== undefined) {
            let getEventDetails = {
                event_code: meetingCodeValue,
                finish: true
            }
            apiEventService.getEvents(getEventDetails).then((data) => {
                setTimeout(() => {
                    setApiresponse(true);
                }, 1000);
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                        if (data.data.status && data.data.status === true && data.data.data && data.data.data.length > 0) {
                            let passwordEnabledValue = false;
                            if (data.data.data[0].password !== undefined && data.data.data[0].password !== "" && data.data.data[0].password !== null) {
                                passwordEnabledValue = true;
                            }

                            setEventList(data.data.data);
                            setPasswordEnabled(passwordEnabledValue);

                            let getSpeakerDetails = {
                                event_id: data.data.data[0]._id,
                                speaker_status: true,
                                back_end_user: true,
                                role: 'speaker'
                            }
                            apiEventUserService.checkEventUserDetailsExists(getSpeakerDetails).then((data) => {
                                if (data && data !== undefined && data !== null && data !== "") {
                                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                        if (data.data.status && data.data.status === 'success' && data.data.data && data.data.data.length > 0) {
                                            let speakerEmail = []
                                            data.data.data.map((users) => {
                                                return speakerEmail.push(users.email)
                                            })
                                            speakersRef.current = data.data.data;
                                            setSpeakerUsers(speakerEmail);
                                        }
                                    }
                                }
                            });

                            let getListnerDetails = {
                                event_id: data.data.data[0]._id,
                                listener_status: true,
                                back_end_user: true,
                                role: 'listener'
                            }
                            apiEventUserService.checkEventUserDetailsExists(getListnerDetails).then((data) => {
                                if (data && data !== undefined && data !== null && data !== "") {
                                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                                        if (data.data.status && data.data.status === 'success' && data.data.data && data.data.data.length > 0) {
                                            let listenerEmail = []
                                            data.data.data.map((users) => {
                                                return listenerEmail.push(users.email)
                                            })
                                            learnersRef.current = data.data.data;
                                            setLearnerUsers(listenerEmail);
                                        }
                                    }
                                }
                            });

                            getEventLanguages(data.data.data[0]._id);

                            if (data.data.data[0] !== undefined && data.data.data[0].useDefault !== undefined && data.data.data[0].useDefault === false) {
                                let logo = REACT_APP_API_IMAGE_URL + data.data.data[0].logo_image;

                                let cover = [];

                                if (data.data.data[0].cover_image !== undefined && data.data.data[0].cover_image !== null && data.data.data[0].cover_image !== "" && data.data.data[0].cover_image.length > 0) {
                                    cover = data.data.data[0].cover_image;
                                    cover = cover.filter(function (el) {
                                        return (el !== undefined && el !== null && el !== "");
                                    });
                                }
                                setLogoImage(logo);
                                setCoverImage(cover);
                            } else {
                                setLogoImage(logoIMAGEWITHTEXT);
                                setCoverImage([]);
                            }

                            if (data.data.data[0] !== undefined) {
                                if (data.data.data[0].login_page_bg !== undefined && data.data.data[0].login_page_bg !== null && data.data.data[0].login_page_bg !== "") {
                                    const loginPageBg = REACT_APP_API_IMAGE_URL + data.data.data[0].login_page_bg?.replace(/\\/g, '/');
                                    if (document.getElementById("loginwrap")) {
                                        document.getElementById("loginwrap").style.backgroundImage = `url('${loginPageBg}')`;
                                        document.getElementById("loginwrap").style.backgroundPosition = "center";
                                        document.getElementById("loginwrap").style.backgroundRepeat = " no-repeat";
                                        document.getElementById("loginwrap").style.backgroundSize = "cover";
                                        document.getElementById("loginwrap").classList.add('loginwrap')
                                        document.getElementById("defaultimg").classList.add('hide')
                                    }
                                }
                            }
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Meeting is not existing."
                            });
                        }
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 401) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Unauthorized Access"
                        })
                    } else if (data.status && data.status !== undefined && data.status !== null && data.status === 422) {
                        Toast.fire({
                            icon: 'warning',
                            title: "Please revalidate the form and submit"
                        })
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "Something went wrong. Please try again!"
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'warning',
                        title: "No response from the server. Please try again!"
                    })
                }
            });
        } else {
            setTimeout(() => {
                setApiresponse(true);
            }, 1000);
            Toast.fire({
                icon: 'warning',
                title: "Something went wrong. Please try again!"
            })
        }
    }

    const getEventLanguages = (eventID) => {
        if (eventID !== "" && eventID !== undefined) {
            let params = {
                event_id: eventID
            }
            api.getLanguagesByEventID(params).then((data) => {
                if (data && data !== undefined && data !== null && data !== "" && data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    if (data.data.data !== "" && data.data.data !== undefined) {
                        let language = data.data.data
                        let langOptions = [{ value: "floor", label: "Original" }];
                        language.map((lang) => {
                            return langOptions.push({ value: lang._id, label: lang.title, flag: lang.language_id?.flag })
                        })
                        console.log(langOptions, "langOptions");
                        setLanguageDetails(langOptions);
                    }
                }
            });
        }
    }

    const submitJoin = async () => {
        if (eventList !== "" && eventList.length > 0) {
            let userName = document.getElementById("rafiky-user-name").value;
            userName = userName.trim();
            let emailID = document.getElementById("rafiky-user-mail").value;
            emailID = emailID.trim();
            emailID = emailID.toLowerCase();

            setErrorMessage('');

            if (userName !== undefined && userName !== null && userName !== "" && emailID !== undefined && emailID !== null && emailID !== "") {

                let lastAtPos = emailID.lastIndexOf('@');
                let lastDotPos = emailID.lastIndexOf('.');
                if (!(lastAtPos < lastDotPos && lastAtPos > 0 && emailID.indexOf('@@') === -1 && lastDotPos > 2 && (emailID.length - lastDotPos) > 2)) {
                    setErrorMessage('Please enter valid email id');
                } else {
                    if (userRole === 'speaker') {
                        if (meetingCodeRef.current.substring(0, 2) !== 'ss') {
                            if (speakerUsers.length > 0) {
                                if (speakerUsers.includes(emailID) === false) {
                                    setErrorMessage('You are not an assigned speaker');
                                    return false;
                                }
                            }
                        }
                    }

                    if (userRole === 'listener') {
                        if (meetingCodeRef.current.substring(0, 2) !== 'ls') {
                            if (learnerUsers.length > 0) {
                                if (learnerUsers.includes(emailID) === false) {
                                    setErrorMessage('You are not an assigned listener');
                                    return false;
                                }
                            }
                        }
                    }

                    if (userRole !== 'listener' || meetingCodeRef.current.substring(0, 2) === 'ls') {
                        if (learnerUsers.length > 0) {
                            if (learnerUsers.includes(emailID) === true) {
                                setErrorMessage('Email address belongs to viewer role. Please use different email address');
                                return false;
                            }
                        }
                    }

                    if (userRole !== 'speaker' || meetingCodeRef.current.substring(0, 2) === 'ss') {
                        if (speakerUsers.length > 0) {
                            if (speakerUsers.includes(emailID) === true) {
                                setErrorMessage('Email address belongs to speaker role. Please use different email address');
                                return false;
                            }
                        }
                    }

                    setErrorMessage('');

                    let userDetails = {
                        name: userName,
                        mail: emailID,
                        user_selected_language: (meetingCodeRef.current !== undefined && meetingCodeRef.current !== null && meetingCodeRef.current !== "" && (meetingCodeRef.current.substring(0, 2) === "s-" || meetingCodeRef.current.substring(0, 2) === "l-" || meetingCodeRef.current.substring(0, 2) === "ss")) ? (selectedOption.value !== undefined && selectedOption.value !== null && selectedOption.value !== "") ? selectedOption.label : "" : "",
                        eventDetails: eventList,
                        user_role: userRole,
                        logo: logoImage,
                        meetingCode: meetingCodeRef.current
                    }

                    let emailData = {
                        email: emailID,
                        event_id: eventList[0]._id
                    }

                    apiEventUserService.checkEmailID(emailData).then(async (data) => {
                        if (data !== undefined && data !== null && data !== "") {
                            if (data.status !== undefined && data.status !== null && data.status === 200) {
                                if (data.data.status !== undefined && data.data.status !== null && data.data.status === true && data.data.data !== undefined && data.data.data !== null && data.data.data !== "") {
                                    if (meetingCodeRef.current.charAt(0) === 'i') {
                                        userDetails.sessionDetails = data.data.data.session;
                                        userDetails.loggedInUserId = data.data.data._id;
                                        const res = await encodeToken(userDetails);
                                        userDetails = res.data.token;
                                        window.localStorage.setItem('eventCodeUser', JSON.stringify(userDetails));
                                        props.history.push("/participant");
                                    } else {
                                        setErrorMessage('Email address belongs to interpreter');
                                    }
                                } else {
                                    if (meetingCodeRef.current !== undefined && meetingCodeRef.current !== null && meetingCodeRef.current !== "" && meetingCodeRef.current.charAt(0) === 'i') {
                                        setErrorMessage('Your are not an assigned interpreter');
                                    } else if (passwordEnabled === true && meetingCodeRef.current !== undefined && meetingCodeRef.current !== null && meetingCodeRef.current !== "" && meetingCodeRef.current.substring(0, 2) === "m-") {
                                        let password = document.getElementById("rafiky-user-password").value;
                                        password = password.trim();
                                        if (password !== "" || password !== null || password !== undefined) {
                                            let eventPassword = eventList[0].password;
                                            if (eventPassword === password) {
                                                const res = await encodeToken(userDetails);
                                                userDetails = res.data.token;
                                                window.localStorage.setItem('eventCodeUser', JSON.stringify(userDetails));
                                                props.history.push("/participant");
                                            } else {
                                                setErrorMessage('Incorrect Password');
                                            }
                                        } else {
                                            setErrorMessage('Event Password is mandatory');
                                        }
                                    } else {
                                        if (userRole === 'listener' || userRole === 'speaker') {
                                            if (learnerUsers.length > 0 || speakerUsers.length > 0) {
                                                updateEventUserDetails(userDetails);
                                            }
                                        }
                                        const res = await encodeToken(userDetails);
                                        userDetails = res.data.token;
                                        window.localStorage.setItem('eventCodeUser', JSON.stringify(userDetails));
                                        props.history.push("/participant");
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                if (userName === "" || userName === null || userName === undefined) {
                    setErrorMessage('Your Name is mandatory');
                } else if (emailID === "" || emailID === null || emailID === undefined) {
                    setErrorMessage('Your Email is mandatory');
                }
            }
        } else {
            Toast.fire({
                icon: 'warning',
                title: "Meeting is not existing."
            });
        }
    }

    const updateEventUserDetails = (userData) => {
        let user = []
        if (userRole === 'speaker') {
            speakersRef.current.map((speaker) => {
                if (speaker.email === userData.mail) {
                    user = speaker;
                }
                return true;
            })
        } else {
            learnersRef.current.map((learner) => {
                if (learner.email === userData.mail) {
                    user = learner;
                }
                return true;
            })
        }
        if (user.back_end_user === true && user.name === "") {
            let userDetails = {
                name: userData.name,
                id: user._id
            }
            apiEventService.updateEventUserDetails(userDetails).then((data) => {
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    }
                }
            })
        }
    }

    const handleLanguageChange = (e) => {
        setSelectedOption(e);
        console.log(e);
    }

    return (
        <section className="main-wrapper">
            {
                !apiresponse && (
                    <ApiLoader />
                )
            }
            
            <div className="login-wrap">
                <div className="img-wrap !bg-primary" id="loginwrap">
                    <div id="defaultimg" className="flex-column">
                        <img src="/login-.jpg" alt="loginjpg" />
                        <div className="text-center mt-3">
                            <a className="small-text white-text text-decoration-none montserrat-font font-normal" href="https://www.youtube.com/watch?v=Fo_GHVw_GoA" target="_blank">Instructions/Tutorial</a>
                        </div>
                    </div>
                </div>
                <div className="content-wrap">
                    {/* <div className="object"><span></span></div> */}
                    {/* <div className="object-left"><span></span></div> */}
                    <div className="form-wrap">
                        <div className="form-inner !max-w-[500px] p-5 !rounded-md shadow-md border !border-gray-50 transition-transform duration-300 ease-in-out transform hover:scale-[1.02]">
                            <div className="main-logo flex items-center justify-center mb-4">
                                {logoImage !== "" && <img src={logoImage} alt="logo" className="logo-holder" />}
                            </div>
                            <form className="mt-3">

                                <div className="form-list">
                                    <label htmlFor="rafiky-user-name" className="form-label mb-2">Name</label>
                                    <div className="input-wrap">
                                        <input name="user-name" id="rafiky-user-name" placeholder="Name" type="text" className='form-control' />
                                        <span className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"></path></svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="form-list">
                                    <label htmlFor="rafiky-user-mail" className="form-label mb-2">Email</label>
                                    <div className="input-wrap">
                                        <input name="user-mail" placeholder="Email" id="rafiky-user-mail" type="text" className='form-control' />
                                        <span className="icon">
                                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                                viewBox="0 0 330.001 330.001">
                                                <g id="XMLID_348_">
                                                    <path id="XMLID_350_" d="M173.871,177.097c-2.641,1.936-5.756,2.903-8.87,2.903c-3.116,0-6.23-0.967-8.871-2.903L30,84.602
                                                        L0.001,62.603L0,275.001c0.001,8.284,6.716,15,15,15L315.001,290c8.285,0,15-6.716,15-14.999V62.602l-30.001,22L173.871,177.097z"
                                                    />
                                                    <polygon id="XMLID_351_" points="165.001,146.4 310.087,40.001 19.911,40 	" />
                                                </g>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                {(passwordEnabled === true && meetingCodeRef.current !== undefined && meetingCodeRef.current !== null && meetingCodeRef.current !== "" && meetingCodeRef.current.substring(0, 2) === "m-") && (
                                    <div className="form-list">
                                        <label htmlFor="rafiky-user-password" className="form-label">Password</label>
                                        <div className="input-wrap">
                                            <input name="password" id="rafiky-user-password" placeholder="Password" type="password" className='form-control' />
                                            <span className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z"></path></svg>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {(meetingCodeRef.current !== undefined && meetingCodeRef.current !== null && meetingCodeRef.current !== "" && (meetingCodeRef.current.substring(0, 2) === "s-" || meetingCodeRef.current.substring(0, 2) === "l-" || meetingCodeRef.current.substring(0, 2) === "ss")) && (
                                    <div className="form-list">
                                        <label htmlFor="language" className="form-label">Default Language</label>
                                        <div className="input-wrap input-select">
                                            <span className="icon">
                                                <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M19.753 10.909c-.624-1.707-2.366-2.726-4.661-2.726-.09 0-.176.002-.262.006l-.016-2.063 3.525-.607c.115-.019.133-.119.109-.231-.023-.111-.167-.883-.188-.976-.027-.131-.102-.127-.207-.109-.104.018-3.25.461-3.25.461l-.013-2.078c-.001-.125-.069-.158-.194-.156l-1.025.016c-.105.002-.164.049-.162.148l.033 2.307s-3.061.527-3.144.543c-.084.014-.17.053-.151.143s.19 1.094.208 1.172c.018.08.072.129.188.107l2.924-.504.035 2.018c-1.077.281-1.801.824-2.256 1.303-.768.807-1.207 1.887-1.207 2.963 0 1.586.971 2.529 2.328 2.695 3.162.387 5.119-3.06 5.769-4.715 1.097 1.506.256 4.354-2.094 5.98-.043.029-.098.129-.033.207l.619.756c.08.096.206.059.256.023 2.51-1.73 3.661-4.515 2.869-6.683zm-7.386 3.188c-.966-.121-.944-.914-.944-1.453 0-.773.327-1.58.876-2.156a3.21 3.21 0 0 1 1.229-.799l.082 4.277c-.385.131-.799.185-1.243.131zm2.427-.553l.046-4.109c.084-.004.166-.01.252-.01.773 0 1.494.145 1.885.361.391.217-1.023 2.713-2.183 3.758zm-8.95-7.668a.196.196 0 0 0-.196-.145h-1.95a.194.194 0 0 0-.194.144L.008 16.916c-.017.051-.011.076.062.076h1.733c.075 0 .099-.023.114-.072l1.008-3.318h3.496l1.008 3.318c.016.049.039.072.113.072h1.734c.072 0 .078-.025.062-.076-.014-.05-3.083-9.741-3.494-11.04zm-2.618 6.318l1.447-5.25 1.447 5.25H3.226z" /></svg>
                                            </span>
                                            <Select
                                                name="language"
                                                value={selectedOption}
                                                options={languageDetails}
                                                noOptionsMessage={() => "No Languages found"}
                                                onChange={handleLanguageChange}

                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        minHeight: "42px",          // input ki height
                                                        height: "42px",
                                                        borderRadius: "9999px",     // fully rounded
                                                        borderColor: state.isFocused ? "#533A84" : "#E5E5E5",
                                                        paddingLeft: "10px",
                                                        boxShadow: "none",
                                                        "&:hover": {
                                                            borderColor: "#533A84",
                                                        },
                                                        fontFamily: "Montserrat",
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: "0 12px", // andar ka spacing same as input
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: 0,
                                                        padding: 0,
                                                        fontFamily: "Montserrat",
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        height: "42px",
                                                    }),
                                                    dropdownIndicator: (base) => ({
                                                        ...base,
                                                        paddingRight: "12px",
                                                        color: "#666",
                                                        "&:hover": {
                                                            color: "#533A84",
                                                        },
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        padding: "8px 12px",
                                                        backgroundColor: state.isFocused ? "#eeebf3" : "white",
                                                        color: "#333",
                                                        cursor: "pointer",
                                                        fontFamily: "Montserrat",
                                                    }),
                                                }}
                                                theme={(theme) => ({
                                                    ...theme,
                                                    borderRadius: 0,
                                                    colors: {
                                                        ...theme.colors,
                                                        primary25: '#eeebf3',
                                                        primary: '#533A84',
                                                    }
                                                })}

                                                formatOptionLabel={(option) => (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <img

                                                            src={option.flag ? `${REACT_APP_API_URL}${option.flag}` : "/favicon.png"}
                                                            alt=""
                                                            style={{ width: "18px", height: "18px", objectFit: "contain" }}
                                                        />
                                                        <span>{option.label}</span>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {errorMessage !== "" && (
                                    <div className="validtxt_msg">{errorMessage}</div>
                                )}

                                <div className="form-list">
                                    <label htmlFor="meeting-code" className="form-label mb-2">Meeting Code</label>
                                    <div className="input-wrap">
                                        <input name="meeting-code" id="meeting-code" placeholder="Meeting Code" type="text" className='form-control !pl-4' value={meetingCode} readOnly />

                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <button type="button" onClick={submitJoin} className="btn btn-primary my-2" disabled={disableBtn}>
                                        {disableBtn === true ? 'Joining...' : 'Join Event'}
                                        {disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                                    </button>
                                </div>
                                {/* <p className="small-text text-center mb-4">By signing in, I agree to the Rafiky's Privacy Statement and Terms of Service.</p> */}
                            </form>
                            {coverImage !== "" && coverImage.length > 0 && (
                                <div className="login-cover-img-wrapper gap-2">
                                    {coverImage.map((value, index) => {
                                        return (
                                            <div className="login-cover-img !min-w-12 !m-0" key={"coverimage_" + index}>
                                                <img src={REACT_APP_API_IMAGE_URL + value} className="object-fill" alt="Sponsor Logo" />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {(coverImage === "" || coverImage.length === 0) && (
                                <div className="social-info">
                                    <p className=""><span>Follow Us </span></p>
                                    <ul>
                                        <li>
                                            <a href="https://www.facebook.com/Rafiky.net" target="_blank" rel="noopener noreferrer">
                                                <img src="/facebook.svg" alt="Facebook" />
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.instagram.com/rafikynet/" target="_blank" rel="noopener noreferrer">
                                                <img src="/instagram.svg" alt="Instagram" />
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://twitter.com/rafiky_net" target="_blank" rel="noopener noreferrer">
                                                <img src="/twitter.svg" alt="Twitter" />
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://www.linkedin.com/company/rafiky/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
                                                <img src="/linkedin.svg" alt="LinkedIn" />
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="text-center">
                                        <a className="term-conditions !text-lg !font-montserrat !text-primary" href="https://www.rafiky.net/en/terms-conditions/" target="_blank" rel="noopener noreferrer"> Terms and conditions</a>
                                    </div>
                                    {/* <div className="text-center mt-2 instruction d-md-none">
                                        <a className="small-text grey-text text-decoration-none" href="https://www.youtube.com/watch?v=Fo_GHVw_GoA" target="_blank" rel="noopener noreferrer">Instructions/Tutorial</a>
                                    </div> */}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <div className="object-leftbottom"><span></span></div> */}
                    {/* <div className="object-bottom "><span></span></div> */}
                    {/* <div className="object-bottomright"><span></span></div> */}
                </div>
            </div>
        </section>
    )
}


export default LoginWithUrlPage;