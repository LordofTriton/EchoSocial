import Head from 'next/head'
import React, { useEffect, useState } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './login.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import LogoSplash from '../components/logo-splash';
import CacheService from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from '../components/form';
import ParamValidator from '../../services/validation/validator';

export default function Login() {
    const router = useRouter()
    const [loginDetails, setLoginDetails] = useState({
        email: "",
        password: ""
    })
    const [loginLoader, setLoginLoader] = useState(false)
    const [alert, setAlert] = useState(null)
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [showSplash, setShowSplash] = useState(true)

    useEffect(() => {
        if (showSplash) setTimeout(() => setShowSplash(false), 5000)
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoginLoader(true)

        if (ParamValidator.isValidEmail(loginDetails.email) && ParamValidator.isValidPassword(loginDetails.password)) {
            const authResult = await APIClient.post(APIClient.routes.login, loginDetails);

            if (authResult.success) {
                localStorage.clear()
                localStorage.setItem("EchoTheme", authResult.data.dark)
                CacheService.saveData("EchoActiveUser", authResult.data)
                CacheService.saveData("EchoUserToken", authResult.data.accessToken)

                document.location = "/"
            }
            else {
                setAlert({ type: "error", message: authResult.message })
                setTimeout(() => setAlert(null), 5000)
            }
        }
        else {
            setAlert({ type: "error", message: "Invalid email or password!" })
            setTimeout(() => setAlert(null), 5000)
        }

        setLoginLoader(false)
    }

    return (
        showSplash ? <LogoSplash /> :
        <div className={styles.loginPage}>
            <Head>
                <title>Echo - Login</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className={styles.loginBanner}>
                <img src={`/images/vectors/two.png`} className={styles.loginVector} alt="vector" />
                <div className={styles.loginLogoBox}>
                    <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.loginLogo} />
                    <span className={styles.loginTitle}>echo</span>
                </div>
            </div>
            <div className={styles.loginFormBox}>
                <div className={styles.loginForm}>
                    <h3 className={styles.loginFormTitle}><span className="titleGradient">Sign In</span></h3>
                    <h3 className={styles.loginFormTip}>Please enter your email and password to access your Echo account.</h3>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className={styles.loginFormField} placeholder="Email Address" value={loginDetails.email} onChange={(e) => setLoginDetails({ ...loginDetails, email: e.target.value })} style={{ backgroundImage: `url(/images/icons/email.png)` }} required />
                            <input type="password" className={styles.loginFormField} placeholder="Password" value={loginDetails.password} onChange={(e) => setLoginDetails({ ...loginDetails, password: e.target.value })} style={{ backgroundImage: `url(/images/icons/password.png)` }} required />
                            <Link href="/forgot-password"><span className={styles.loginFormFYP}>Forgot password?</span></Link>

                            <Form.Submit text="SIGN IN" loader={loginLoader} />
                            <span className={styles.loginSignUp}>Don`t have an account? <Link href="/signup"><span>Sign Up</span></Link>!</span>
                        </form>
                    </div>
                </div>
            </div>

            {/* <div className={styles.loginHeader}>
                <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.loginHeaderLogo} />
                <span className={styles.loginHeaderTitle}>echo</span>
            </div>
            <div className={styles.loginContainer}>
                <div className={styles.loginContainerVectorBox}>
                    <img src={`/images/vectors/login.jpg`} className={styles.loginContainerVector} alt="vector" />
                </div>
                <div className={styles.loginContainerFormBox}>
                    <h3 className={styles.loginContainerFormBoxTitle}>Sign In</h3>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className={styles.loginContainerFormField} placeholder="Email Address" value={loginDetails.email} onChange={(e) => setLoginDetails({...loginDetails, email: e.target.value})} style={{backgroundImage: `url(/images/icons/email.png)`}} required/>
                            <input type="password" className={styles.loginContainerFormField} placeholder="Password" value={loginDetails.password} onChange={(e) => setLoginDetails({...loginDetails, password: e.target.value})} style={{backgroundImage: `url(/images/icons/password.png)`}} required/>
                            <Link href="/fyp"><span className={styles.loginContainerFormFYP}>Forgot password?</span></Link>

                            <Form.Submit text="SIGN IN" loader={loginLoader} />
                            <span className={styles.loginContainerSignUp}>Don`t have an account? <Link href="/signup"><span>Sign Up</span></Link>!</span>
                        </form>
                    </div>
                </div>
            </div> */}

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null}
        </div>
    )
}