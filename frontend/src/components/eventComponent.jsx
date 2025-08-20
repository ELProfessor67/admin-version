import React, { useState, useEffect, useCallback, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import { ClipLoader } from "react-spinners";
import apiEventService from "@/service/event/eventService";
import Swal from 'sweetalert2';
import helper from '@/utils/helper';
import moment from "moment";
import 'moment-timezone';
import { Toast } from "@/components/toastComponent";
import defaultLogo from "@/assets/img/logo-demo.png";
import trashIcon from "@/assets/img/trash.svg";
import uploadIcon from "@/assets/img/upload.svg";
import apiEventUploadService from "@/service/event/eventUploadService";
import { REACT_APP_API_URL } from "@/constants/URLConstant";
const _REACT_APP_API_URL = REACT_APP_API_URL + "/";

export default class Event extends React.PureComponent {

    

    constructor(props) {
        super(props);
        this.state = {
            coverImage: [],
            coverIMGFormatErrorMsg: '',

            logoImage: '',
            logoIMGFormatErrorMsg: '',
            logoImageURL: '',

            lobbyResource:'',
            lobbyResourceFormatErrorMsg: '',
            lobbyResourceFormat:'image',
            lobbyResourceName:'',
            lobbyResourceURL: '',

            loginPageBg: '',
            loginPageBgFormatErrorMsg: '',
            loginPageBgUrl: '',

            landingPageBg: '',
            landingPageBgFormatErrorMsg: '',
            landingPageBgUrl: '',

            conferencePageBg: '',
            conferencePageBgFormatErrorMsg: '',
            conferencePageBgUrl: '',

            saveEvent: [],
            coverImageURL: [],
            
            eventID: '',
            disableBtn: false,
            maxCoverImageAllowedCount: 5,
            maxCoverImagesAllowed: ["0", "1", "2", "3", "4"],
            coverImageValues: [],
            initialValues: {
                eventName: '',
                eventAddress: '',
                event_date: '',
                event_start_time: '',
                event_end_time: '',
                testEvent: false,
                repeatWeekly: false,
                description: '',
                useDefault: false,
                useBgDefault: false
            },
        }
        this.userCredentials = "";
        this.eventCode = "";
        this.coverImageLoaded = false;
        this.logoImageLoaded = false;
        this.lobbyResourceLoaded = false;
        this.loginPageBgLoaded = false;
        this.landingPageBgLoaded = false;
        this.conferencePageBgLoaded = false;
        this.eventID = ""
        this.editEventDetails = "";
        this.getUserCredentials();


        
    }

    async getUserCredentials() {
        this.userCredentials = await helper.decodeEncodedItem(localStorage.getItem("userDetails"));
    }

    diff_minutes = (dt2, dt1) => {

        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));

    }

   

    componentDidMount() {
        this.splittedURL = this.props.location.pathname.split("/");
        if (this.splittedURL[2] !== "" && this.splittedURL[2] !== undefined) {
            this.eventID = this.splittedURL[2];
            
         

            if (this.props.editEventData !== undefined && this.props.editEventData !== null && this.props.editEventData !== "") {

                let dts1 = new Date(this.props.editEventData.start_time);
                let dts2 = new Date(this.props.editEventData.end_time);

                var updatedEventEndTime = new Date(this.props.editEventData.start_time);
                updatedEventEndTime.setMinutes(updatedEventEndTime.getMinutes() + this.diff_minutes(dts1, dts2));
                updatedEventEndTime = moment(updatedEventEndTime).format('MM/DD/YYYY HH:mm:ss')
               
                
                this.setState({initialValues: {
                    eventName: this.props.editEventData.name,
                    eventAddress: this.props.editEventData.address,
                    event_date: new Date(moment(this.props.editEventData.start_date_time).format("YYYY-MM-DD HH:mm")),
                    event_start_time: new Date(moment(this.props.editEventData.start_time).format("YYYY-MM-DD HH:mm")),
                    event_end_time: new Date(updatedEventEndTime),
                    testEvent: this.props.editEventData.testEvent,
                    repeatWeekly: this.props.editEventData.repeatWeekly,
                    description: this.props.editEventData.description,
                    useDefault: this.props.editEventData.useDefault,
                    useBgDefault: this.props.editEventData.useBgDefault
                }})
                
                this.eventCode = this.props.editEventData.event_code;

                if (this.props.editEventData.cover_image !== undefined && this.props.editEventData.cover_image !== null && this.props.editEventData.cover_image !== "" && this.props.editEventData.cover_image.length > 0) {
                    let coverImageURLValues = [];
                    let coverImageValues = [];
                    for (var ciu = 0; ciu < this.props.editEventData.cover_image.length; ciu++) {
                        if (this.props.editEventData.cover_image[ciu] !== undefined) {
                            if (this.props.editEventData.cover_image[ciu] !== null && this.props.editEventData.cover_image[ciu] !== "") {
                                coverImageURLValues.push(_REACT_APP_API_URL + this.props.editEventData.cover_image[ciu])
                                coverImageValues.push(this.props.editEventData.cover_image[ciu])
                            } else {
                                coverImageURLValues.push("")
                                coverImageValues.push("")
                            }
                        }
                    }

                    this.setState({ coverImageURL: coverImageURLValues, coverImageValues: coverImageValues })
                }

                if (this.props.editEventData.logo_image !== undefined && this.props.editEventData.logo_image !== null && this.props.editEventData.logo_image !== "") {
                    this.setState({ logoImageURL: _REACT_APP_API_URL + this.props.editEventData.logo_image })
                }
                if (this.props.editEventData.lobby_resource !== undefined && this.props.editEventData.lobby_resource !== null && this.props.editEventData.lobby_resource !== "") {
                    this.setState({ lobbyResourceURL: _REACT_APP_API_URL + this.props.editEventData.lobby_resource })
                }
                if (this.props.editEventData.login_page_bg !== undefined && this.props.editEventData.login_page_bg !== null && this.props.editEventData.login_page_bg !== "") {
                    this.setState({ loginPageBgUrl: _REACT_APP_API_URL + this.props.editEventData.login_page_bg })
                }
                if (this.props.editEventData.landing_page_bg !== undefined && this.props.editEventData.landing_page_bg !== null && this.props.editEventData.landing_page_bg !== "") {
                    this.setState({ landingPageBgUrl: _REACT_APP_API_URL + this.props.editEventData.landing_page_bg })
                }
                if (this.props.editEventData.conference_page_bg !== undefined && this.props.editEventData.conference_page_bg !== null && this.props.editEventData.conference_page_bg !== "") {
                    this.setState({ conferencePageBgUrl: _REACT_APP_API_URL + this.props.editEventData.conference_page_bg })
                }
                

                this.setState({ eventID: this.props.editEventData._id })
            }
            
        } else {
            this.generateUniqueEventCode();
        }
    }

    

    validationSchema = Yup.object().shape({
        eventName: Yup.string()
            .trim()
            .required("Event Name is required"),
        eventAddress: Yup.string()
            .trim()
            .required("Event Address is required"),
        event_date: Yup.date()
            .required('Start date is required'),
        event_start_time: Yup.date()
            .required('Start Time is required'),
        event_end_time: Yup.date()
            .required('End Time is required').min(Yup.ref('event_start_time'),
                () => 'End time must be greater than start time'),
    });

    generateUniqueEventCode = () => {
        let randomCode = helper.randomCodeGenerator();
        let randomNumber = randomCode.slice(0, 3) + '-' + randomCode.slice(3, 6) + '-' + randomCode.slice(6);
        if (randomNumber !== "" && randomNumber !== undefined && this.eventCode === "") {
            apiEventService.checkEventCode(randomNumber).then((data) => {
                if (data && data !== undefined && data !== null && data !== "") {
                    if (data.data.status && data.data.status !== undefined && data.data.status !== null && data.data.status === true) {
                        if (data.data.data !== "" && data.data.data !== null && data.data.data.length > 0) {
                            this.generateUniqueEventCode();
                        } else {
                            this.eventCode = randomNumber;
                        }
                    }
                }
            });
        }
    }

    imageValidation = () => {
        
        if (this.state.logoImage === "") {
            this.setState({ logoIMGFormatErrorMsg: 'Please upload a logo image' });
        }
    }

    submitEventDetails = (values) => {
        this.setState({ coverIMGFormatErrorMsg: '', logoIMGFormatErrorMsg: '', lobbyResourceFormatErrorMsg: '' });
        if (this.eventCode === "") {
            Toast.fire({
                icon: 'error',
                title: "Something went wrong. Please Refresh Page and try again"
            })
        } else if (values.useDefault === false && values.useBgDefault === false && this.state.logoImageURL === "" && this.state.logoImage === "") {
            this.imageValidation();
        } else {
            this.saveEventDetails(values);
        }
    }
    
    removeCoverImageConfirmation = (index) => {
        Swal.fire({
            title: 'Remove Cover Image',
            text: "Are you sure you want to remove?",
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
                this.removeCoverImage(index);
            }
        })
    }
    removeImageConfirmation = (type) => {
        Swal.fire({
            title: 'Remove Image',
            text: "Are you sure you want to remove?",
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
                this.removeImage(type);
            }
        })
    }
    removeImage = (type) => {
        let eventData = {
            '_id': this.state.eventID
        }
        
        switch (type) {
            case 'lobbyResourceURL':
                this.setState({lobbyResourceURL:''})
                eventData['lobby_resource'] = 'delete';
                break;
            case 'loginPageBgUrl':
                this.setState({loginPageBgUrl:''})
                eventData['login_page_bg'] = 'delete';
                break;
            case 'landingPageBgUrl':
                this.setState({landingPageBgUrl:''})
                eventData['landing_page_bg'] = 'delete';
                break;
            case 'conferencePageBgUrl':
                this.setState({conferencePageBgUrl:''})
                eventData['conference_page_bg'] = 'delete';
                break;
            case 'logoimage':
                this.setState({logoImageURL:''})
                eventData['logo_image'] = 'delete';
                break;
                
            default:
                break;
        }
        apiEventService.updateEventDetails(eventData).then((response) => {
            if (response && response !== undefined && response !== null && response !== "") {
                if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {
                    this.props.saveEventDetails(response.data, "nomove");
                    Toast.fire({
                        icon: 'success',
                        title: "Image removed successfully"
                    })
                    
                } else {
                    Toast.fire({
                        icon: 'success',
                        title: "Please try again later"
                    })  
                }
            } else {
                Toast.fire({
                    icon: 'success',
                    title: "No response from the server. Please try again later"
                })
            }
        });

    }
    removeCoverImage = (index) => {

        var coverImages = this.state.coverImage;
        coverImages[index] = "";

        this.setState({ coverImage: [...coverImages] })

        var coverImageURLs = this.state.coverImageURL;
        coverImageURLs[index] = "";

        this.setState({ coverImageURL: [...coverImageURLs] })

        if (this.state.coverImageValues !== undefined && this.state.coverImageValues !== null && this.state.coverImageValues !== "" && this.state.coverImageValues.length > 0 && this.state.coverImageValues[index] !== undefined && this.state.coverImageValues[index] !== null && this.state.coverImageValues[index] !== "") {
            let coverImagesData = this.state.coverImageValues;
            coverImagesData[index] = "";
            this.setState({ coverImageValues: [...coverImagesData] })

            let eventData = {
                '_id': this.state.eventID,
                'cover_image': coverImagesData
            }
            apiEventService.updateEventDetails(eventData).then((response) => {
                if (response && response !== undefined && response !== null && response !== "") {
                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {
                        this.props.saveEventDetails(response.data, "nomove");
                        Toast.fire({
                            icon: 'success',
                            title: "Image removed successfully"
                        })
                        
                    } else {
                        Toast.fire({
                            icon: 'success',
                            title: "Please try again later"
                        })  
                    }
                } else {
                    Toast.fire({
                        icon: 'success',
                        title: "No response from the server. Please try again later"
                    })
                }
            });

        }

    }
    onCoverIMGChangeHandler = (event, position) => {
        
        this.coverImageLoaded = true;
        let file = event.target.files[0];
        this.setState({ coverIMGFormatErrorMsg: '' })


        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    coverIMGFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ coverIMGFormatErrorMsg: '5 GB file size exceeds' })
            } else {

                var coverImages = this.state.coverImage;
                coverImages[position] = file;

                this.setState({ coverImage: [...coverImages] })

                this.setImage(file, 'cover', position);
            }

        } else {
            this.setState({
                coverIMGFormatErrorMsg: "Please upload file"
            })
        }
    };
    
    onLobbyResourceChangeHandler = event => {
        this.lobbyResourceLoaded = true;
        let file = event.target.files[0];
        this.setState({ lobbyResourceFormatErrorMsg: '' })
        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "video/mp4"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    lobbyResourceFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ lobbyResourceFormatErrorMsg: '5 GB file size exceeds' })
            } else {
                const data = new FormData()
                data.append('file', file);
                let lobbyResourceFormat = 'image';
                if(file.name.split('.').pop() === 'mp4'){
                    lobbyResourceFormat = 'video';
                }
                this.setState({ lobbyResource: data , lobbyResourceFormat:lobbyResourceFormat , lobbyResourceName:file.name});
                this.setImage(file, 'lobby');
            }

        } else {
            this.setState({
                lobbyResourceFormatErrorMsg: "Please upload file"
            })
        }
    };
    onLoginPageBgChangeHandler = event => {
        this.loginPageBgLoaded = true;
        let file = event.target.files[0];
        this.setState({ loginPageBgFormatErrorMsg: '' })
        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    loginPageBgFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ loginPageBgFormatErrorMsg: '5 GB file size exceeds' })
            } else {
                const data = new FormData()
                data.append('file', file);
                this.setState({ loginPageBg: data });
                this.setImage(file, 'loginPageBg');
            }

        } else {
            this.setState({
                loginPageBgFormatErrorMsg: "Please upload file"
            })
        }
    };
    onLandingPageBgChangeHandler = event => {
        this.landingPageBgLoaded = true;
        let file = event.target.files[0];
        this.setState({ landingPageBgFormatErrorMsg: '' })
        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    landingPageBgFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ landingPageBgFormatErrorMsg: '5 GB file size exceeds' })
            } else {
                const data = new FormData()
                data.append('file', file);
                this.setState({ landingPageBg: data });
                this.setImage(file, 'landingPageBg');
            }

        } else {
            this.setState({
                landingPageBgFormatErrorMsg: "Please upload file"
            })
        }
    };
    onConferencePageBgChangeHandler = event => {
        this.conferencePageBgLoaded = true;
        let file = event.target.files[0];
        this.setState({ conferencePageBgFormatErrorMsg: '' })
        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    conferencePageBgFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ conferencePageBgFormatErrorMsg: '5 GB file size exceeds' })
            } else {
                const data = new FormData()
                data.append('file', file);
                this.setState({ conferencePageBg: data });
                this.setImage(file, 'conferencePageBg');
            }

        } else {
            this.setState({
                conferencePageBgFormatErrorMsg: "Please upload file"
            })
        }
    };

   

    onLogoIMGChangeHandler = event => {
        this.logoImageLoaded = true;
        let file = event.target.files[0];
        this.setState({ logoIMGFormatErrorMsg: '' })
        const types = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
        ];
        if (file !== "") {
            if (types.every(type => file.type !== type)) {
                this.setState({
                    logoIMGFormatErrorMsg: file.name + " File format not supported"
                });
            } else if (file['size'] > 5368709120) {
                this.setState({ logoIMGFormatErrorMsg: '5 GB file size exceeds' })
            } else {
                const data = new FormData()
                data.append('file', file);
                this.setState({ logoImage: data });
                this.setImage(file, 'logo');
            }

        } else {
            this.setState({
                logoIMGFormatErrorMsg: "Please upload file"
            })
        }
    };
    setImage = (imageData, type, position) => {
        var reader = new FileReader();
        reader.readAsDataURL(imageData);
        reader.onload = () => {
            if (reader.result !== null) {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    if (type === 'logo') {
                        this.setState({ logoImageURL: reader.result });
                    }else if(type === 'lobby'){
                        this.setState({ lobbyResourceURL: reader.result });
                    }else if(type === 'loginPageBg'){
                        this.setState({ loginPageBgUrl: reader.result });
                    }else if(type === 'landingPageBg'){
                        this.setState({ landingPageBgUrl: reader.result });
                    }else if(type === 'conferencePageBg'){
                        this.setState({ conferencePageBgUrl: reader.result });
                    } else {

                        var coverImageURLs = this.state.coverImageURL;
                        coverImageURLs[position] = reader.result;

                        this.setState({ coverImageURL: [...coverImageURLs] })

                    }
                }
            }
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    uploadCoverImg = (eventID, initialCount, coverImagesData, type) => {

        if (initialCount < this.state.maxCoverImageAllowedCount) {

            let nextCount = parseInt(initialCount) + +1;

            if (this.state.coverImage[initialCount] !== undefined && this.state.coverImage[initialCount] !== null && this.state.coverImage[initialCount] !== "") {
                let cidata = new FormData();
                cidata.append('file', this.state.coverImage[initialCount]);
              

                apiEventUploadService.uploadCoverImg(eventID, cidata).then((data) => {
                    if (data && data !== undefined && data !== null && data !== "") {

                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {

                            coverImagesData[initialCount] = data.data.path;
                            this.uploadCoverImg(eventID, nextCount, coverImagesData, type);

                        } else {
                            this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
                        }

                    } else {
                        this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
                    }
                })
            } else {
                this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
            }
        } else {
            let eventData = {
                '_id': eventID,
                'cover_image': coverImagesData
            }
            apiEventService.updateEventDetails(eventData).then((response) => {

                this.setState({ disableBtn: false });

                if (response && response !== undefined && response !== null && response !== "") {
                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {
                        this.props.saveEventDetails(response.data);
                        if (type === "add") {
                            Toast.fire({
                                icon: 'success',
                                title: "Event added successfully"
                            })
                        } else {
                            Toast.fire({
                                icon: 'success',
                                title: "Event updated successfully"
                            })
                        }
                    }
                }
            });
        }

    }

    saveImages = (eventID, useDefault = false, type = "add") => {

        let coverImagesData = (this.state.coverImageValues !== undefined && this.state.coverImageValues !== null && this.state.coverImageValues !== "" && this.state.coverImageValues.length > 0) ? this.state.coverImageValues : [];

        if (this.coverImageLoaded === true && this.state.coverImage.length > 0) {

            let initialCount = 0;
            let nextCount = parseInt(initialCount) + +1;

            if (this.state.coverImage[initialCount] !== undefined && this.state.coverImage[initialCount] !== null && this.state.coverImage[initialCount] !== "") {
                let cidata = new FormData();
                cidata.append('file', this.state.coverImage[initialCount]);

                apiEventUploadService.uploadCoverImg(eventID, cidata).then((data) => {
                    if (data && data !== undefined && data !== null && data !== "") {

                        if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {

                            coverImagesData[initialCount] = data.data.path;
                            this.uploadCoverImg(eventID, nextCount, coverImagesData, type);

                        } else {
                            this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
                        }

                    } else {
                        this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
                    }
                })
            } else {
                this.uploadCoverImg(eventID, nextCount, coverImagesData, type);
            }           
        }
        if (this.state.lobbyResource !== "") {
            if (this.lobbyResourceLoaded === true) {
                apiEventUploadService.uploadLobbyResource(eventID, this.state.lobbyResource).then((data1) => {
                    // this.setState({ disableBtn: false });
                    
                    if (data1 && data1 !== undefined && data1 !== null && data1 !== "") {
                        if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 200) {

                            let eventData = {
                                '_id': eventID,
                                'lobby_resource': data1.data.path
                            }
                            apiEventService.updateEventDetails(eventData).then((response) => {
                                if (response && response !== undefined && response !== null && response !== "") {
                                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                        if (this.state.coverImage === undefined || this.state.coverImage === null || this.state.coverImage === "" || this.state.coverImage.length <= 0) {
                                            this.setState({ disableBtn: false });
                                            this.props.saveEventDetails(response.data);
                                            if (type === "add") {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event added successfully"
                                                })
                                            } else {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event updated successfully"
                                                })
                                            }
                                        }
                                    }
                                }
                            });
                            this.lobbyResourceLoaded = false;
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 401) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Unauthorized Access in lobby background upload"
                            })
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 422) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Please revalidate the form and submit"
                            })
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong in lobby background upload. Please try again!"
                            })
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        })
                    }
                });
            }

        }
        if (this.state.loginPageBg !== "") {
            if (this.loginPageBgLoaded === true) {
                apiEventUploadService.uploadLoginPageBg(eventID, this.state.loginPageBg).then((data1) => {
                    // this.setState({ disableBtn: false });
                    
                    if (data1 && data1 !== undefined && data1 !== null && data1 !== "") {
                        if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 200) {

                            let eventData = {
                                '_id': eventID,
                                'login_page_bg': data1.data.path
                            }
                            apiEventService.updateEventDetails(eventData).then((response) => {
                                if (response && response !== undefined && response !== null && response !== "") {
                                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                        if (this.state.coverImage === undefined || this.state.coverImage === null || this.state.coverImage === "" || this.state.coverImage.length <= 0) {
                                            this.setState({ disableBtn: false });
                                            this.props.saveEventDetails(response.data);
                                            if (type === "add") {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event added successfully"
                                                })
                                            } else {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event updated successfully"
                                                })
                                            }
                                        }
                                    }
                                }
                            });
                            this.loginPageBgLoaded = false;
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 401) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Unauthorized Access in login page background upload"
                            })
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 422) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Please revalidate the form and submit"
                            })
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong in login page background upload. Please try again!"
                            })
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        })
                    }
                });
            }

        }
        if (this.state.landingPageBg !== "") {
            if (this.landingPageBgLoaded === true) {
                apiEventUploadService.uploadLandingPageBg(eventID, this.state.landingPageBg).then((data1) => {
                    // this.setState({ disableBtn: false });
                    
                    if (data1 && data1 !== undefined && data1 !== null && data1 !== "") {
                        if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 200) {

                            let eventData = {
                                '_id': eventID,
                                'landing_page_bg': data1.data.path
                            }
                            apiEventService.updateEventDetails(eventData).then((response) => {
                                if (response && response !== undefined && response !== null && response !== "") {
                                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                        if (this.state.coverImage === undefined || this.state.coverImage === null || this.state.coverImage === "" || this.state.coverImage.length <= 0) {
                                            this.setState({ disableBtn: false });
                                            this.props.saveEventDetails(response.data);
                                            if (type === "add") {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event added successfully"
                                                })
                                            } else {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event updated successfully"
                                                })
                                            }
                                        }
                                    }
                                }
                            });
                            this.landingPageBgLoaded = false;
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 401) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Unauthorized Access in landing page background upload"
                            })
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 422) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Please revalidate the form and submit"
                            })
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong in landing page background upload. Please try again!"
                            })
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        })
                    }
                });
            }

        }
        if (this.state.conferencePageBg !== "") {
            if (this.conferencePageBgLoaded === true) {
                apiEventUploadService.uploadConferencePageBg(eventID, this.state.conferencePageBg).then((data1) => {
                    // this.setState({ disableBtn: false });
                    
                    if (data1 && data1 !== undefined && data1 !== null && data1 !== "") {
                        if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 200) {

                            let eventData = {
                                '_id': eventID,
                                'conference_page_bg': data1.data.path
                            }
                            apiEventService.updateEventDetails(eventData).then((response) => {
                                if (response && response !== undefined && response !== null && response !== "") {
                                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                        if (this.state.coverImage === undefined || this.state.coverImage === null || this.state.coverImage === "" || this.state.coverImage.length <= 0) {
                                            this.setState({ disableBtn: false });
                                            this.props.saveEventDetails(response.data);
                                            if (type === "add") {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event added successfully"
                                                })
                                            } else {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event updated successfully"
                                                })
                                            }
                                        }
                                    }
                                }
                            });
                            this.conferencePageBgLoaded = false;
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 401) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Unauthorized Access in conference page background upload"
                            })
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 422) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Please revalidate the form and submit"
                            })
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong in conference page background upload. Please try again!"
                            })
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        })
                    }
                });
            }

        }
        if (this.state.logoImage !== "") {
            if (this.logoImageLoaded === true) {
                console.log("this.state.logoImage", this.state.logoImage.get('file'));
                apiEventUploadService.uploadLogoImg(eventID, this.state.logoImage).then((data1) => {
                   
                    
                    if (data1 && data1 !== undefined && data1 !== null && data1 !== "") {
                        if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 200) {

                            let eventData = {
                                '_id': eventID,
                                'logo_image': data1.data.path
                            }
                            apiEventService.updateEventDetails(eventData).then((response) => {
                                if (response && response !== undefined && response !== null && response !== "") {
                                    if (response.status && response.status !== undefined && response.status !== null && response.status === 200) {

                                        if (this.state.coverImage === undefined || this.state.coverImage === null || this.state.coverImage === "" || this.state.coverImage.length <= 0) {
                                            this.setState({ disableBtn: false });
                                            this.props.saveEventDetails(response.data);
                                            if (type === "add") {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event added successfully"
                                                })
                                            } else {
                                                Toast.fire({
                                                    icon: 'success',
                                                    title: "Event updated successfully"
                                                })
                                            }
                                        }
                                    }
                                }
                            });
                            this.logoImageLoaded = false;
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 401) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Unauthorized Access in logo image upload"
                            })
                        } else if (data1.status && data1.status !== undefined && data1.status !== null && data1.status === 422) {
                            Toast.fire({
                                icon: 'warning',
                                title: "Please revalidate the form and submit"
                            })
                        } else {
                            Toast.fire({
                                icon: 'warning',
                                title: "Something went wrong in logo upload. Please try again!"
                            })
                        }
                    } else {
                        Toast.fire({
                            icon: 'warning',
                            title: "No response from the server. Please try again!"
                        })
                    }
                });
            }

        } else if (useDefault === true) {
            this.setState({ disableBtn: false });
            this.props.saveEventDetails(this.state.eventDetails);
            
        }


    }

    addZero = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    saveEventDetails = (values) => {

        console.log(JSON.stringify(values))
        let eventStartDateTime = values.event_date;
        eventStartDateTime = new Date(eventStartDateTime).setHours(this.addZero(new Date(values.event_start_time).getHours()))
        eventStartDateTime = new Date(eventStartDateTime).setMinutes(this.addZero(new Date(values.event_start_time).getMinutes()))
        eventStartDateTime = new Date(eventStartDateTime).setSeconds(this.addZero(new Date(values.event_start_time).getSeconds()))
        eventStartDateTime = new Date(eventStartDateTime);

        let eventEndDateTime = new Date(eventStartDateTime);
        eventEndDateTime.setMinutes(eventEndDateTime.getMinutes() + this.diff_minutes(new Date(values.event_start_time), new Date(values.event_end_time)));
        eventEndDateTime = new Date(eventEndDateTime);


    

        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let selectedDateTime = moment(values.event_date);
        let datecode = moment({
            year: selectedDateTime.year(),
            month: selectedDateTime.month(),
            day: selectedDateTime.date(),
            hour: selectedDateTime.hour(),
            minute: selectedDateTime.minute(),
            second: selectedDateTime.second(),
            millisecond: 0
        });

        let localTime = moment(datecode).format("YYYY-MM-DD HH:mm:ss");
        let convertedEventTime = moment.tz(localTime, timezone);

        let eventDetails = {
            'name': values.eventName,
            'address': values.eventAddress,
            'testEvent': values.testEvent,
            'repeatWeekly': values.repeatWeekly,
            'date': convertedEventTime,
            'start_time': eventStartDateTime,
            'end_time': eventEndDateTime,
            'start_date_time': eventStartDateTime,
            'description': values.description,
            'event_code': this.eventCode,
            'cover_image': '',
            'logo_image': '',
            'lobby_resource': '',
            'finish': false,
            'useDefault': values.useDefault,
            'user_id': this.userCredentials.id,
            'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }

        this.setState({ disableBtn: true });
        if (JSON.stringify(eventDetails) === JSON.stringify(this.state.saveEvent)) {
            if (this.coverImageLoaded === true || this.logoImageLoaded === true || this.lobbyResourceLoaded === true || this.loginPageBgLoaded === true || this.landingPageBgLoaded === true || this.conferencePageBgLoaded === true) {
                this.saveImages(this.state.eventID, "", "update");
            } else {
                this.props.stepToEventFile();
                this.setState({ disableBtn: false });
            }
        } else {

            this.setState({ saveEvent: eventDetails });

            if (this.state.eventID !== '') {
                let eventParams = {
                    'name': values.eventName,
                    'address': values.eventAddress,
                    'testEvent': values.testEvent,
                    'repeatWeekly': values.repeatWeekly,
                    'useDefault': values.useDefault,
                    'date': values.event_date,
                    'start_time': eventStartDateTime,
                    'end_time': eventEndDateTime,
                    'start_date_time': eventStartDateTime,
                    'description': values.description,
                    '_id': this.state.eventID
                }
                this.updateEventDetails(eventParams);
            } else {
                this.addEventDetails(eventDetails);
            }
        }
    }

    updateEventDetails = (eventParams) => {
        apiEventService.updateEventDetails(eventParams).then((data) => {
            if (this.coverImageLoaded === false && this.logoImageLoaded === false) {
                this.setState({ disableBtn: false });
            }
            if (data && data !== undefined && data !== null && data !== "") {
                if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    
                    if (this.coverImageLoaded === false && this.logoImageLoaded === false) {

                        let details = {
                            'data': data.data.data
                        }
                        this.setState({ eventDetails: details }, () => {
                            this.props.saveEventDetails(this.state.eventDetails);
                        })
                        
                        Toast.fire({
                            icon: 'success',
                            title: "Event updated successfully"
                        })
                        this.props.saveEventDetails(data.data);

                    }
                    if (this.coverImageLoaded === true || this.logoImageLoaded === true || this.lobbyResourceLoaded || this.loginPageBgLoaded || this.landingPageBgLoaded || this.conferencePageBgLoaded) {   

                        this.saveImages(data.data.data._id, eventParams.useDefault, "update");

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
    }

    addEventDetails = (eventParams) => {
        apiEventService.addEvent(eventParams).then((data) => {
            this.setState({ disableBtn: false });
            if (data && data !== undefined && data !== null && data !== "") {
                if (data.status && data.status !== undefined && data.status !== null && data.status === 200) {
                    let details = {
                        'data': data.data.result
                    }
                    this.setState({ eventID: data.data.result._id, eventDetails: details }, () => { 
                        this.saveImages(data.data.result._id, eventParams.useDefault, "add"); 
                    });
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
    }
    getLobbyResourceName = (url) =>{
       let fileName = url.substring(url.lastIndexOf('/')+1);
       let nameonly = fileName.substring(25,fileName.length);
       return nameonly;
    }
    redirectToEventList = () => {
        this.props.history.push("/events");
    }

    eventDetailsForm = ({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        handleReset,
        setFieldValue
    }) => {
        return (
            <Form onSubmit={handleSubmit}>
                <div className="event-detail-blk">
                    <div className="d-flex event-gen-set">
                        <div className="formgrp-txt-wrapper">
                            <label className="formgrp-label">Event Name<span>*</span></label>
                            <Field type="text" value={values.eventName} maxLength="1500" name="eventName" className="form-input" placeholder="Event Name" />
                            <ErrorMessage name="eventName" component="div" className="validtxt_msg" />
                            <div className="d-flex checkbox-wrapper">
                                <label className="custom-checkbox">
                                    <input type="checkbox"
                                        name="testEvent"
                                        value={values.testEvent}
                                        checked={values.testEvent === true ? "checked" : ""}
                                        onChange={() => { setFieldValue('testEvent', !values.testEvent); }} />
                                    <span className="checkmark"></span>
                                </label>
                                <div className="checkbox-label">Test Event</div>
                            </div>
                        </div>
                        <div className="formgrp-txt-wrapper formgrp-right">
                            <label className="formgrp-label">Event Address<span>*</span></label>
                            <Field type="text" maxLength="1500" name="eventAddress" className="form-input" placeholder="Event address" />
                            <ErrorMessage name="eventAddress" component="div" className="validtxt_msg" />
                            <div className="d-flex checkbox-wrapper">
                                <label className="custom-checkbox">
                                    <input type="checkbox"
                                        name="repeatWeekly"
                                        value={values.repeatWeekly}
                                        checked={values.repeatWeekly === true ? "checked" : ""}
                                        onChange={() => { setFieldValue('repeatWeekly', !values.repeatWeekly); }} />
                                    <span className="checkmark"></span>
                                </label>
                                <div className="checkbox-label">Repeat Weekly</div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex event-date-config">
                        <div className="formgrp-txt-wrapper">
                            <label className="formgrp-label">Date<span>*</span></label>
                            <DatePicker
                                selected={values.event_date}
                                onChange={(e) => {
                                    setFieldValue('event_date', e);
                                }}
                                onChangeRaw={(e) => { e.preventDefault() }}
                                className="custom-date"
                                timeIntervals={10}
                                dateFormat="MMMM d, yyyy "
                                timeCaption="time"
                                placeholderText="Select date "
                                minDate={moment().toDate()}
                            />
                            <ErrorMessage name="event_date" component="div" className="validtxt_msg" />
                        </div>
                        <div className="formgrp-txt-wrapper formgrp-right">
                            <label className="formgrp-label">Start Time<span>*</span></label>
                            <DatePicker
                                selected={values.event_start_time}
                                onChange={(e) => {
                                    setFieldValue('event_start_time', e);
                                }}
                                className="custom-date"
                                onChangeRaw={(e) => { e.preventDefault() }}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                placeholderText="Select start time "
                            />
                            <ErrorMessage name="event_start_time" component="div" className="validtxt_msg" />
                        </div>
                        <div className="formgrp-txt-wrapper formgrp-right">
                            <label className="formgrp-label">End Time<span>*</span></label>
                            <DatePicker
                                selected={values.event_end_time}
                                onChange={(e) => {
                                    setFieldValue('event_end_time', e);
                                }}
                                className="custom-date"
                                onChangeRaw={(e) => { e.preventDefault() }}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                placeholderText="Select end time "
                            />
                            <ErrorMessage name="event_end_time" component="div" className="validtxt_msg" />
                        </div>
                    </div>
                    <div className="event-desc-wrapper">
                        <div className="formgrp-txt-wrapper">
                            <label className="formgrp-label">Description</label>
                            <Field type="textarea" maxLength="1500" name="description" className="event-txtarea" />
                        </div>
                    </div>

                    <div className="formgrp-txt-wrapper">
                        <div className="d-flex checkbox-wrapper">
                            <label className="custom-checkbox">
                                <input type="checkbox"
                                    name="useDefault"
                                    value={values.useDefault}
                                    checked={values.useDefault === true ? "checked": ""}
                                    onChange={() => { setFieldValue('useDefault', !values.useDefault); }} />
                                <span className="checkmark"></span>
                            </label>
                            <div className="checkbox-label">Use Rafiky Main Logo</div>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap event-advan-setting">
                        <div className="logo-img-uploader-blk">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Main Logo</label>
                            </div>
                            <div className="cover-img-uploader">
                                {
                                    this.state.logoImageURL === "" && 
                                    (
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <label className="logo-upload-file mb-3">
                                                <input type="file" className="d-none" onChange={this.onLogoIMGChangeHandler} />
                                                <img alt="logo" src={this.state.logoImageURL !== "" ? this.state.logoImageURL : defaultLogo} />
                                            </label>
                                            <div className="notification-area">
                                                <div className="notification-text">Supported formats: <span>jpg, jpeg, png</span></div>
                                                <div className="notification-text">Recommended Dimension: <span>180 X 80</span></div>
                                            </div>
                                        </div>
                                    )
                                }

                                {
                                    this.state.logoImageURL !== "" && 
                                    (
                                            <>
                                                <input className="uploadFileType" id="logoimg" type="file" name="file" onChange={this.onLogoIMGChangeHandler} />
                                                <label className="object-cover cover-image" htmlFor={"logoimg"}>
                                                    <img src={this.state.logoImageURL} alt="logo" className="object-contain" />
                                                    
                                                </label>
                                                <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={this.removeImageConfirmation.bind(this,'logoimage')}>
                                                            <img src={trashIcon} alt="Delete"/>
                                                        </div>
                                                    </div>
                                                
                                            </>
                                    )
                                }
                            </div>
                            <span className="text-danger">{this.state.logoIMGFormatErrorMsg}</span>
                        </div>
                    </div>
                    <div className="formgrp-txt-wrapper">
                        <div className="d-flex checkbox-wrapper">
                            <label className="custom-checkbox">
                                <input type="checkbox"
                                    name="useBgDefault"
                                    value={values.useBgDefault}
                                    checked={values.useBgDefault === true ? "checked": ""}
                                    onChange={() => { setFieldValue('useBgDefault', !values.useBgDefault); }} />
                                <span className="checkmark"></span>
                            </label>
                            <div className="checkbox-label">Use Rafiky Default Backgrounds</div>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap event-advan-setting">
                        <div className="logo-img-uploader-blk top-10-margin floatleft">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Lobby Background</label>
                            </div>
                            <div className="cover-img-uploader">
                                {
                                    this.state.lobbyResourceURL === "" && 
                                    (
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <label className="logo-upload-file mb-3">
                                                <input type="file" className="d-none" onChange={this.onLobbyResourceChangeHandler} />
                                                <img alt="logo" src={uploadIcon} />
                                            </label>
                                            <div className="notification-area">
                                                <div className="notification-text">Supported formats: <span>jpg, jpeg, png , mp4</span></div>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    this.state.lobbyResourceURL !== "" && 
                                    (
                                            <>
                                                <input className="uploadFileType" id="loggyrs" type="file" name="file" onChange={this.onLobbyResourceChangeHandler} />
                                                <label className="object-cover cover-image" htmlFor={"loggyrs"}>
                                                    <img src={(this.state.lobbyResourceFormat === "video" || this.state.lobbyResourceURL.indexOf('.mp4') > -1) ? '/vidicon.png': (this.state.lobbyResourceURL !== "" ? this.state.lobbyResourceURL:uploadIcon)} alt="logo" className="object-contain" />
                                                    
                                                </label>
                                                <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={this.removeImageConfirmation.bind(this,'lobbyResourceURL')}>
                                                            <img src={trashIcon} alt="Delete"/>
                                                        </div>
                                                    </div>
                                                
                                            </>
                                    )
                                }
                                
                            </div>
                            <span className="text-danger">{this.state.lobbyResourceFormatErrorMsg}</span>
                        </div>
                        <div className="logo-img-uploader-blk top-10-margin floatleft">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Login Page Image</label>
                            </div>
                            <div className="cover-img-uploader">
                                {
                                    this.state.loginPageBgUrl === "" && 
                                    (
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <label className="logo-upload-file mb-3">
                                                <input type="file" className="d-none" onChange={this.onLoginPageBgChangeHandler} />
                                                <img alt="logo" src={uploadIcon} />
                                            </label>
                                            <div className="notification-area">
                                                <div className="notification-text">Supported formats: <span>jpg, jpeg, png</span></div>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    this.state.loginPageBgUrl !== "" && 
                                    (
                                            <>
                                                <input className="uploadFileType" id="loginbgr" type="file" name="file" onChange={this.onLoginPageBgChangeHandler} />
                                                <label className="object-cover cover-image" htmlFor={"loginbgr"}>
                                                    <img src={this.state.loginPageBgUrl !== "" ? this.state.loginPageBgUrl : uploadIcon} alt="logo" className="object-contain" />
                                                
                                                </label>
                                                <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={this.removeImageConfirmation.bind(this,'loginPageBgUrl')}>
                                                            <img src={trashIcon} alt="Delete" />
                                                        </div>
                                                    </div>
                                                
                                            </>
                                    )
                                }
                            </div>
                            <span className="text-danger">{this.state.loginPageBgFormatErrorMsg}</span>
                        </div>
                        <div className="logo-img-uploader-blk top-10-margin floatleft">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Landing Page Image</label>
                            </div>
                            
                            <div className="cover-img-uploader">
                            
                            {
                                    this.state.landingPageBgUrl === "" && 
                                    (
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <label className="logo-upload-file mb-3">
                                                <input type="file" className="d-none" onChange={this.onLandingPageBgChangeHandler} />
                                                <img alt="landing bg" src={uploadIcon} />
                                            </label>
                                            <div className="notification-area">
                                                <div className="notification-text">Supported formats: <span>jpg, jpeg, png</span></div>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    this.state.landingPageBgUrl !== "" && 
                                    (
                                            <>
                                                <input className="uploadFileType" id="landingbg" type="file" name="file" onChange={this.onLandingPageBgChangeHandler} />
                                                <label className="object-cover cover-image" htmlFor={"landingbg"}>
                                                    <img src={this.state.landingPageBgUrl !== "" ? this.state.landingPageBgUrl : uploadIcon}  alt="landing bg" className="object-contain" />
                                                    
                                                </label>
                                                <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={this.removeImageConfirmation.bind(this,'landingPageBgUrl')}>
                                                            <img src={trashIcon} alt="Delete" />
                                                        </div>
                                                    </div>
                                                
                                            </>
                                    )
                                }
                                </div>
                            <span className="text-danger">{this.state.landingPageBgFormatErrorMsg}</span>
                        </div>
                        <div className="logo-img-uploader-blk top-10-margin floatleft">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Conference Page Image</label>
                            </div>
                            <div className="cover-img-uploader">

                            {
                                    this.state.conferencePageBgUrl === "" && 
                                    (
                                        <div className="d-flex flex-column justify-content-center align-items-center">
                                            <label className="logo-upload-file mb-3">
                                                <input type="file" className="d-none" onChange={this.onConferencePageBgChangeHandler} />
                                                <img alt="conference bg" src={uploadIcon} />
                                            </label>
                                            <div className="notification-area">
                                                <div className="notification-text">Supported formats: <span>jpg, jpeg, png</span></div>
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    this.state.conferencePageBgUrl !== "" && 
                                    (
                                            <>
                                                <input className="uploadFileType" id="confbg" type="file" name="file" onChange={this.onConferencePageBgChangeHandler} />
                                                <label className="object-cover cover-image" htmlFor={"confbg"}>
                                                    <img src={this.state.conferencePageBgUrl !== "" ? this.state.conferencePageBgUrl : uploadIcon}  alt="landing bg" className="object-contain" />
                                                    
                                                </label>
                                                <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={this.removeImageConfirmation.bind(this,'conferencePageBgUrl')}>
                                                            <img src={trashIcon} alt="Delete" />
                                                        </div>
                                                    </div>
                                                
                                            </>
                                    )
                                }
                            </div>
                            <span className="text-danger">{this.state.conferencePageBgFormatErrorMsg}</span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap event-advan-setting">
                        {/* <div className="cover-img-uploader-blk">
                            <div className="formgrp-txt-wrapper mb0">
                                <label className="formgrp-label">Cover Image</label>
                            </div>
                            <div className="cover-img-uploader">
                                {this.state.coverImageURL !== "" ?
                                    <>
                                        <input className="uploadFileType" id="coverImage" type="file" name="file" onChange={this.onCoverIMGChangeHandler} />
                                        <label className="object-cover" htmlFor="coverImage">
                                            <img src={this.state.coverImageURL} alt="coverImage" className="object-cover" />
                                        </label>
                                    </>
                                    :
                                    <>
                                        <div className="d-flex flex-column justify-content-end align-items-center h-100">
                                            <div className="cover-img-wrapper">
                                                <img alt="upload" src={uploadIcon} />
                                            </div>
                                            <div className="or-seperator">or</div>
                                            <label className="btn-action">
                                                <input type="file" className="d-none" onChange={this.onCoverIMGChangeHandler} />Browse
                                            </label>
                                        </div>
                                        <span className="text-danger">{this.state.coverIMGFormatErrorMsg}</span>
                                    </>
                                }
                            </div>
                        </div> */}

                        {
                            this.state.maxCoverImagesAllowed.map((value, index) => {
                                return (
                                    <div className="cover-img-uploader-blk" key={"coverimage_"+index}>
                                        <div className="formgrp-txt-wrapper mb0">
                                            {index === 0 && (
                                                <label className="formgrp-label">Sponsor Logo</label>
                                            )}
                                            {index !== 0 && (
                                                <label className="formgrp-label">&nbsp;</label>
                                            )}
                                        </div>
                                        <div className="cover-img-uploader">
                                            {this.state.coverImageURL[index] !== undefined && this.state.coverImageURL[index] !== null && this.state.coverImageURL[index] !== "" ?
                                                <>
                                                    <input className="uploadFileType" id={"coverImage_"+index} type="file" name="file" data-index = {index} onChange={(e) => this.onCoverIMGChangeHandler(e, index)} />
                                                    <label className="object-cover cover-image" htmlFor={"coverImage_" + index}>
                                                        <img src={this.state.coverImageURL[index]} alt="coverImage" className="object-contain" />
                                                    </label>
                                                    <div className="cover-img-del-blk" >
                                                        <div className="cover-img-del-wrapper" onClick={(e) => this.removeCoverImageConfirmation(index)}>
                                                            <img src={trashIcon} alt="Delete"  />
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                <div className="btn-section">
                                                    {/* <div className="cover-img-wrapper">
                                                        <img alt="upload" src={uploadIcon} />
                                                    </div>
                                                    <div className="or-seperator">or</div> */}
                                                    <label className="btn-action"><input type="file" className="d-none" onChange={(e) => this.onCoverIMGChangeHandler(e, index)} />Browse</label>
                                                    <div className="notification-area">
                                                        <div className="notification-text">Supported formats: <span>jpg, jpeg, png</span></div>
                                                        <div className="notification-text">Recommended Dimension: <span>100 X 70</span></div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                        
                        {/* <div className="location-blk"></div>
                        <div className="theme-set-blk"></div> */}
                    </div>
                </div>
                <div className="d-flex align-items-center btn-acn-blk">
                    <button type="button" className="prev-btn" onClick={() => { this.redirectToEventList(); }}>Cancel</button>
                    <button type="submit" className="next-btn" disabled={this.state.disableBtn}>
                        Next {' '}
                        {this.state.disableBtn === true ? <ClipLoader size={15} color={"#fff"} loading={true} /> : ''}
                    </button>
                </div>
            </Form>
        )
    }

    render() {
        return (
            <React.Fragment >
                <Formik
                    enableReinitialize
                    initialValues={this.state.initialValues}
                    validationSchema={this.validationSchema}
                    onSubmit={this.submitEventDetails}
                >
                    {this.eventDetailsForm}
                </Formik>
            </React.Fragment >
        );
    }
}