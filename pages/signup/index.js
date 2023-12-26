import Head from 'next/head'
import React, { useState } from "react";
import AppConfig from "../../util/config";
import styles from "./signup.module.css"
import axios from "axios";

import { useRouter } from 'next/router'
import Link from 'next/link'

import Alert from "../components/alert";
import CacheService from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import ParamValidator from '../../services/validation/validator';

export default function Signup() {
    const router = useRouter()
    const [signupDetails, setSignupDetails] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [signupLoader, setSignupLoader] = useState(false)
    const [alert, setAlert] = useState(null)
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSignupLoader(true)
        if (!isValidData()) return;

        if (signupDetails.password.trim() === signupDetails.confirmPassword.trim()) {
            const authResult = await APIClient.post(APIClient.routes.createAccount, signupDetails);
            if (authResult.success) {
                localStorage.clear()
                localStorage.setItem("EchoTheme", authResult.data.dark)
                CacheService.saveData("EchoActiveUser", authResult.data)
                CacheService.saveData("EchoUserToken", authResult.data.accessToken)

                router.push("/nodes")
            }
            else {
                setAlert({ type: "error", message: authResult.message })
            }
        }
        else {
            setAlert({ type: "warning", message: "Passwords do not match!" })
        }

        setSignupLoader(false)
    }

    const isValidData = () => {
        if (signupDetails.firstName.trim().length < 2 || signupDetails.firstName.includes(" ")) return false;
        if (signupDetails.lastName.trim().length < 2 || signupDetails.lastName.includes(" ")) return false;
        if (!ParamValidator.isValidEmail(signupDetails.email)) return false;
        if (!ParamValidator.isValidPassword(signupDetails.password)) return false;
        if (signupDetails.password !== signupDetails.confirmPassword) return false;
        return true;
    }

    return (
        <div className={styles.signupPage}>
        <Head>
            <title>Echo - Sign Up</title>
            <meta name="description" content="A simple social media." />
            <link rel="icon" href="/newLogoIcon.ico" />
            <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
        </Head>

        <div className={styles.signupBanner}>
                <img src={`/images/vectors/one.png`} className={styles.signupVector} alt="vector" />
                <div className={styles.signupLogoBox}>
                    <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.signupLogo} />
                    <span className={styles.signupTitle}>echo</span>
                </div>
            </div>
            <div className={styles.signupFormBox}>

                <div className={styles.signupForm}>
                    <h3 className={styles.signupFormTitle}>Welcome to <span className="titleGradient">Echo!</span></h3>
                    <h3 className={styles.signupFormTip}>Discover a world of interesting stuff by creating a free Echo account! Already have an account? <span>Log In</span></h3>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className={styles.signupFormField} placeholder="First Name" value={signupDetails.firstName} onChange={(e) => setSignupDetails({...signupDetails, firstName: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/user1.png)`, float: "left"}} required/>
                            {signupDetails.firstName && signupDetails.firstName.trim().length < 3 ? <span className={styles.formErrorMessage}>First Name must be more than 2 letters.</span> : null}
                            {signupDetails.firstName && signupDetails.firstName.includes(" ") ? <span className={styles.formErrorMessage}>No spaces.</span> : null}

                            <input type="text" className={styles.signupFormField} placeholder="Last Name" value={signupDetails.lastName} onChange={(e) => setSignupDetails({...signupDetails, lastName: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/user1.png)`, float: "right"}} required/>
                            {signupDetails.lastName && signupDetails.lastName.trim().length < 3 ? <span className={styles.formErrorMessage}>Last Name must be more than 2 letters.</span> : null}
                            {signupDetails.lastName && signupDetails.lastName.includes(" ") ? <span className={styles.formErrorMessage}>No spaces.</span> : null}

                            <input type="email" className={styles.signupFormField} placeholder="Email Address" value={signupDetails.email} onChange={(e) => setSignupDetails({...signupDetails, email: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/email.png)`}} required/>
                            {signupDetails.email && !ParamValidator.isValidEmail(signupDetails.email) ? <span className={styles.formErrorMessage}>Please enter a valid email.</span> : null}

                            <input type="password" className={styles.signupFormField} placeholder="Password (at least six characters)" value={signupDetails.password} onChange={(e) => setSignupDetails({...signupDetails, password: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "left"}} required/>
                            {signupDetails.password && !ParamValidator.isValidPassword(signupDetails.password) ? <span className={styles.formErrorMessage}>Password must be at least 6 characters. No spaces.</span> : null}

                            <input type="password" className={styles.signupFormField} placeholder="Confirm Password (same as above)" value={signupDetails.confirmPassword} onChange={(e) => setSignupDetails({...signupDetails, confirmPassword: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "right"}} required/>
                            {signupDetails.confirmPassword && signupDetails.password !== signupDetails.confirmPassword ? <span className={styles.formErrorMessage}>{`Passwords don't match.`}</span> : null}

                            <button className={styles.signupFormSubmit} style={{opacity: isValidData() ? "1" : "0.5"}}>{ 
                                signupLoader ? <center><div className="loader" style={{width: "30px", height: "30px"}}></div></center> : "SIGN UP" 
                            }</button>
                            <span className={styles.signupLogIn}>Already have an account? <Link href="/login"><span>Sign In</span></Link>!</span>
                        </form>
                    </div>
                </div>
            </div>

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null }
        </div>
    )
}