import React, { useState, useEffect, useRef } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import jwt from "jwt-simple";
import Header from "@/components/headerComponent";
import { Box, Container } from '@mui/material';
import { Toast } from "@/components/toastComponent";
import { authService } from "@/service/auth/authService";
import { REACT_APP_JWT_SECRET } from "@/constants/URLConstant";

const LoginPage = (props) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [disableBtn, setDisableBtn] = useState(false);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    useEffect(() => {
        if (localStorage.getItem('userDetails')) {
            props.history.push('/events');
        } else {
            props.history.push('/');
        }
        console.log('####### == BUILD ID jan 19 435435 ==###')
    }, [props.history]);

    const handleLogin = async (email, password) => {
        setDisableBtn(true);
        setErrorMessage('');
        try {
            const emailExistsResponse = await authService.checkEmailAlreadyExists({ email: email.toLowerCase() });

            if (!emailExistsResponse?.data?.alreadyExists) {
                setErrorMessage('You are not a registered user!');
                setDisableBtn(false);
                return;
            }

            const loginResponse = await authService.loginwithPassword({ email, password });

            if (loginResponse?.data?.status === true) {
                setErrorMessage('Logged in');
                let loggedinUserDetails = loginResponse.data.token;
                // loggedinUserDetails = jwt.encode(loggedinUserDetails, REACT_APP_JWT_SECRET, 'HS512');
                window.localStorage.setItem('userDetails', JSON.stringify(loggedinUserDetails));
                localStorage.removeItem("eventCodeUser");
                props.history.push("/events");
            } else {
                setErrorMessage('Invalid Password');
            }
        } catch (error) {
            console.error("Login failed:", error);
            let message = "Something went wrong. Please try again!";
            if (error.response) {
                 if (error.response.status === 401) message = "Unauthorized Access";
                 else if (error.response.status === 422) message = "Please revalidate the form and submit";
            }
             Toast.fire({
                icon: 'warning',
                title: message
            });
        } finally {
            setDisableBtn(false);
        }
    };

    const submitLogin = () => {
        setErrorMessage('');
        const email = emailInputRef.current.value.trim();
        const password = passwordInputRef.current.value.trim();

        if (!email) {
            setErrorMessage('Email field is required');
            return;
        }
        if (!password) {
            setErrorMessage('Password field is required');
            return;
        }

        const lastAtPos = email.lastIndexOf('@');
        const lastDotPos = email.lastIndexOf('.');
        if (!(lastAtPos < lastDotPos && lastAtPos > 0 && email.indexOf('@@') === -1 && lastDotPos > 2 && (email.length - lastDotPos) > 2)) {
            setErrorMessage('Please enter valid email id');
            return;
        }

        handleLogin(email, password);
    };

    return (
        <section className="scheduller-session">
            <Header {...props} />
            <Box
                display="flex"
                flexDirection="column"
                height="100%"
                justifyContent="center"
            >
                <Container maxWidth="sm">
                    <div style={{ 'padding': '35px' }}>
                        <div className="d-flex event-gen-set flex-column">
                            <div className="formgrp-txt-wrapper">
                                <label htmlFor="email" className="formgrp-label">Email</label>
                                <input ref={emailInputRef} name="email" id="rafiky-email" type="text" className='form-input' />
                            </div>
                            <div className="formgrp-txt-wrapper">
                                <label htmlFor="password" className="formgrp-label">Password</label>
                                <input ref={passwordInputRef} name="password" id="rafiky-password" type="password" className='form-input' />
                            </div>
                        </div>
                        {errorMessage &&
                            <div className="validtxt_msg">{errorMessage}</div>
                        }
                        <div className="form-group" style={{ 'paddingTop': '35px' }}>
                            <button type="button" onClick={submitLogin} className="next-btn" disabled={disableBtn}>
                                {disableBtn ? 'Logging In...' : 'LOGIN'}
                                {disableBtn && <ClipLoader size={15} color={"#fff"} loading={true} />}
                            </button>
                        </div>
                    </div>
                </Container>
            </Box>
        </section>
    );
};

export default LoginPage;