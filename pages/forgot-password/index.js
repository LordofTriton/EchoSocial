import Head from 'next/head'
import React, { useEffect, useState } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './forgot-password.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import LogoSplash from '../components/logo-splash';
import CacheService from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from '../components/form';

export default function ForgotPassword() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [loader, setLoader] = useState(false)
    const [alert, setAlert] = useState(null)
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [sent, setSent] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoader(true)

        if (email.trim().length > 2 && email.includes("@")) {
            const response = (await APIClient.post(APIClient.routes.forgotPassword, { email })).data;

            if (response.success) {
                setAlert({ type: "success", message: response.message })
                setSent(true)
            }
            else {
                setAlert({ type: "error", message: response.message })
            }
        }
        else {
            setAlert({ type: "error", message: "Invalid email." })
        }

        setLoader(false)
    }

    return (
        <div className={styles.fypPage}>
            <Head>
                <title>Echo - Forgot Password</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className={styles.fypBanner}>
                <img src={`/images/vectors/four.png`} className={styles.fypVector} alt="vector" />
                <div className={styles.fypLogoBox}>
                    <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.fypLogo} />
                    <span className={styles.fypTitle}>echo</span>
                </div>
            </div>
            <div className={styles.fypFormBox}>
                <div className={styles.fypForm}>
                    <h3 className={styles.fypFormTitle}>Forgot your <span className="titleGradient">password</span>?</h3>

                    {
                        sent ?
                        <>
                            <h3 className={styles.fypFormTip}>{`We've sent you a link to reset your password in the mail. Please click the link to recover your account.`}</h3>
                            <Form.Submit text="Return to Log In" onClick={() => router.push("/login")} />
                        </> : 
                        <>
                            <h3 className={styles.fypFormTip}>We'll help you recover your account in no time! Simply input your email address below.</h3>
                            <div>
                                <form onSubmit={handleSubmit}>
                                    <input type="text" className={styles.fypFormField} placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ backgroundImage: `url(/images/icons/email.png)` }} required />
                                    
                                    <Form.Submit text="Continue" loader={loader} />
                                    <span className={styles.fypSignUp}>Don`t have an account? <Link href="/signup"><span>Sign Up</span></Link>!</span>
                                </form>
                            </div>
                        </>
                    }
                </div>
            </div>

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null}
        </div>
    )
}