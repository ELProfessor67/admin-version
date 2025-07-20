import React, { useState, useEffect, useMemo } from "react";
import helper from "@/utils/helper";
import avatarIcon from "@/assets/img/avatar.webp";
import ReactImageFallback from "react-image-fallback";
import jwt from "jwt-simple";
import logo2_01 from "@/assets/img/logo-2-01.png";
import logoutIcon from "@/assets/img/logout.svg";
import vdotsIcon from "@/assets/img/vdots.svg";

const Header = (props) => {
    const [userRole, setUserRole] = useState("");
    const [meetingCode, setMeetingCode] = useState('');
    const [userCredentials, setUserCredentials] = useState(null);
    const [loading, setLoading] = useState(true);

    // const userCredentials = useMemo(() => {
    //     const userDetails = localStorage.getItem("userDetails");
    //     return userDetails ? helper.decodeEncodedItem(userDetails) : null;
    // }, []);

    useEffect(() => {
        const userDetails = localStorage.getItem("userDetails");
        if(!userDetails || userCredentials) return;
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
    
    
    useEffect(() => {
       const getUser = async () => {
        const eventCodeUser = localStorage.getItem('eventCodeUser');
        if (eventCodeUser) {
            try {
                // const eventDetails = jwt.decode(eventCodeUser, process.env.REACT_APP_JWT_SECRET, 'HS512');
                const eventDetails = await helper.decodeEncodedItem(eventCodeUser)
                if (eventDetails) {
                    if (eventDetails.user_role) {
                        setUserRole(eventDetails.user_role);
                    }
                    if (eventDetails.meetingCode) {
                        setMeetingCode(eventDetails.meetingCode);
                    }
                }
            } catch (error) {
                console.error("Failed to decode JWT:", error);
            }
        }
       }
    }, []);

    const logout = () => {
        props.history.push('/logout');
    };

    return (
        <div className="justify-content-between vdo-top-part event-header-mobile meet-room-header">
            <div className="d-flex align-items-center">
                <div className="logoo">
                    {meetingCode.substring(0, 2) !== 'l-' && (
                        props.logoIMG ?
                            <img style={{ "width": 'unset', "maxWidth": '100%', "height": '60px' }} src={props.logoIMG} alt="logo" /> :
                            <img alt="logo" src={logo2_01} style={{ "width": "150px" }} />
                    )}
                </div>
            </div>
            {userCredentials ? (
                <>
                    <div className="vdo-top-right-part">
                        <div className="event-avatar-blk">
                            {userCredentials.profile_pic ?
                                <ReactImageFallback src={userCredentials.profile_pic} fallbackImage={avatarIcon} initialImage={avatarIcon} alt="profile pics" className="avatar" /> :
                                <div className="avatar_initial">
                                    <div className="avatar_initial_text">
                                        {helper.Capitalize(userCredentials.name.charAt(0))}
                                    </div>
                                </div>
                            }
                        </div>
                        <span className="username">{userCredentials.name}</span>
                        <div className="event-avatar-blk" title='logout' onClick={logout}>
                            <img alt="avatar" src={logoutIcon} className="object-cover" />
                        </div>
                    </div>
                    <div className="schedule-toggler-blk">
                        <div className="schedule-toggler"><img alt="dots" src={vdotsIcon} /></div>
                    </div>
                </>
            ) : userRole === "listener" && (
                <a href="https://conference.rafikyconnect.net/teams-login" className="event-avatar-blk" title='logout'>
                    <img alt="avatar" src={logoutIcon} className="object-cover" />
                </a>
            )}
        </div>
    );
};

export default React.memo(Header);



