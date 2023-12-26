import Head from 'next/head'
import React, { useEffect, useState } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './reset-password.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import LogoSplash from '../components/logo-splash';
import CacheService from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from '../components/form';
import ParamValidator from '../../services/validation/validator';

export default function ResetPassword() {
    const router = useRouter()
    const [password, setPassword] = useState({
        newPassword: "",
        confirmNewPassword: ""
    })
    const [loader, setLoader] = useState(false)
    const [alert, setAlert] = useState(null)
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [resetSuccess, setResetSuccess] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoader(true)
        if (!router.query.token) return;

        if (password.newPassword.trim().length > 6 && password.newPassword === password.confirmNewPassword) {
            const response = await APIClient.post(APIClient.routes.resetPassword, {
                token: router.query.token,
                ...password
            });

            if (response.success) {
                setAlert({ type: "success", message: response.message })
                setResetSuccess(true);
            }
            else {
                setAlert({ type: "error", message: response.message })
            }
        }
        else {
            setAlert({ type: "error", message: "Invalid values." })
        }

        setLoader(false)
    }

    return (
        <div className={styles.resetPage}>
            <Head>
                <title>Echo - reset</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className={styles.resetBanner}>
                <img src={`/images/vectors/five.png`} className={styles.resetVector} alt="vector" />
                <div className={styles.resetLogoBox}>
                    <img src={`/images/newLogoTransparent.png`} alt="logo" className={styles.resetLogo} />
                    <span className={styles.resetTitle}>echo</span>
                </div>
            </div>
            <div className={styles.resetFormBox}>
                <div className={styles.resetForm}>
                    <h3 className={styles.resetFormTitle}>Reset your <span className="titleGradient">password</span>.</h3>

                    {
                        resetSuccess ?
                        <>
                        <h3 className={styles.resetFormTip}>Your password has been successfully reset! You can proceed to log in with your new password.</h3>
                        <Form.Submit text="Continue to Log In" onClick={() => router.push("/login")} />
                        </> :
                        <>
                        <h3 className={styles.resetFormTip}>You can now reset your password to recover your Echo account. Please set a new password.</h3>
                        <div>
                            <form onSubmit={handleSubmit}>
                                <input type="password" className={styles.resetFormField} placeholder="Password (at least six characters)" value={password.newPassword} onChange={(e) => setPassword({...password, newPassword: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "left"}} required/>
                                {password.newPassword && !ParamValidator.isValidPassword(password.newPassword) ? <span className={styles.formErrorMessage}>Password must be at least 6 characters.</span> : null}
    
                                <input type="password" className={styles.resetFormField} placeholder="Confirm Password (same as above)" value={password.confirmNewPassword} onChange={(e) => setPassword({...password, confirmNewPassword: e.target.value.trim()})} style={{backgroundImage: `url(/images/icons/password.png)`, float: "right"}} required/>
                                {password.confirmNewPassword && password.newPassword !== password.confirmNewPassword ? <span className={styles.formErrorMessage}>{`Passwords don't match.`}</span> : null}
    
                                <Form.Submit text="Reset Password" loader={loader} />
                                <span className={styles.resetSignUp}>Don`t have an account? <Link href="/signup"><span>Sign Up</span></Link>!</span>
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