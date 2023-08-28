import Head from 'next/head'
import React, { useState } from "react";
import AppConfig from "../../util/config";
import styles from "./signup.module.css"
import axios from "axios";

import { useRouter } from 'next/router'
import Link from 'next/link'

import Alert from "../components/alert";
import Cache from "../../services/CacheService";
import APIClient from "../../services/APIClient";

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

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSignupLoader(true)

        if (signupDetails.password.trim() === signupDetails.confirmPassword.trim()) {
            const authResult = (await APIClient.post("/accounts/create-account", signupDetails)).data;
            if (authResult.success) {
                Cache.saveData("EchoUser", authResult.data)
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

    return (
        <div className={styles.signupPage}>
        <Head>
            <title>Echo - Sign Up</title>
            <meta name="description" content="A simple social media." />
            <link rel="icon" href="/favicon.ico" />
            <link rel="stylesheet" href={`/styles/themes/classic-light.css`} />
        </Head>
        <div className={styles.signupHeader}>
            <img src={`/images/logo.png`} alt="logo" className={styles.signupHeaderLogo} />
            <span className={styles.signupHeaderTitle}>echo</span>
        </div>
            <div className={styles.signupContainer}>
                <div className={styles.signupContainerVectorBox}>
                    <img src={`/images/vectors/signup.jpg`} className={styles.signupContainerVector} alt="vector" />
                </div>
                <div className={styles.signupContainerFormBox}>
                    <h3 className={styles.signupContainerFormBoxTitle}>Sign Up</h3>
                    <div>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className={styles.signupContainerFormFieldHalf} placeholder="First Name" value={signupDetails.firstName} onChange={(e) => setSignupDetails({...signupDetails, firstName: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/user1.png)`, float: "left"}} required/>
                            <input type="text" className={styles.signupContainerFormFieldHalf} placeholder="Last Name" value={signupDetails.lastName} onChange={(e) => setSignupDetails({...signupDetails, lastName: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/user1.png)`, float: "right"}} required/>
                            <input type="text" className={styles.signupContainerFormFieldFull} placeholder="Email Address" value={signupDetails.email} onChange={(e) => setSignupDetails({...signupDetails, email: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/email.png)`}} required/>
                            <input type="password" className={styles.signupContainerFormFieldHalf} placeholder="Password" value={signupDetails.password} onChange={(e) => setSignupDetails({...signupDetails, password: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "left"}} required/>
                            <input type="password" className={styles.signupContainerFormFieldHalf} placeholder="Confirm Password" value={signupDetails.confirmPassword} onChange={(e) => setSignupDetails({...signupDetails, confirmPassword: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "right"}} required/>

                            <button className={styles.signupContainerFormSubmit}>{ 
                                signupLoader ? <center><div className="loader" style={{width: "30px", height: "30px"}}></div></center> : "SIGN UP" 
                            }</button>
                            <span className={styles.signupContainerLogIn}>Already have an account? <Link href="/login"><span>Sign In</span></Link>!</span>
                        </form>
                    </div>
                </div>
            </div>

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null }
        </div>
    )
}