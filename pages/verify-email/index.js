import Head from 'next/head'
import React, { useEffect, useState } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './verify-email.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import LogoSplash from '../components/logo-splash';
import CacheService from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from '../components/form';

export default function VerifyEmail() {
    const router = useRouter()
    const [loader, setLoader] = useState(true)
    const [alert, setAlert] = useState(null)
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        const code = router.query.code;
        if (!code) return;
        verifyEmail(code)
    }, [router.query]);

    const verifyEmail = async (code) => {
        const response = (await APIClient.post(APIClient.routes.verifyEmail, { code })).data;
        setVerified(response.success)
        setLoader(false)
    }

    return (
        <div className={styles.verifyEmailPage}>
            <Head>
                <title>Echo - Verify Email</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.verifyLogo} />
            <div className={styles.container}>
                { loader ? <span className={styles.verifyEmailLoader}>Verifying email...</span> : null}
                { 
                    verified && !loader ? 
                    <>
                        <span className={styles.verifyEmailText}>Email Verified</span>
                        <Form.Submit text="Continue" onClick={() => router.push("/")} style={{
                            backgroundColor: "var(--accent)",
                            color: "white",
                            width: "100%"
                        }} />
                    </> : null
                }
                { 
                    !verified && !loader ? 
                    <>
                        <span className={styles.verifyEmailText}>Verification Failed</span>
                        <Form.Submit text="Retry" onClick={() => router.reload()} style={{
                            backgroundColor: "var(--primary)",
                            color: "white",
                            width: "100%"
                        }} />
                    </> : null
                }
            </div>
        </div>
    )
}