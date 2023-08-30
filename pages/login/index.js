import Head from 'next/head'
import React, { useState } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './login.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import Cache from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from '../components/form';

export default function Login() {
    const router = useRouter()
    const [loginDetails, setLoginDetails] = useState({
        email: "",
        password: ""
    })
    const [loginLoader, setLoginLoader] = useState(false)
    const [alert, setAlert] = useState(null)
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoginLoader(true)

        if (loginDetails.email.trim().length > 2 && loginDetails.password.trim().length >= 8) {
            const authResult = (await APIClient.post("/auth/login", loginDetails)).data;

            if (authResult.success) {
                Cache.saveData("EchoUser", authResult.data)
                localStorage.setItem("EchoTheme", authResult.data.dark)
                const activeUser = Cache.getData("EchoUser")
                console.log(activeUser)

                router.push("/")
            }
            else {
                setAlert({ type: "error", message: authResult.message })
            }
        }
        else {
            setAlert({ type: "warning", message: "Invalid email or password!" })
        }
        
        setLoginLoader(false)
    }

    return(
        <div className={styles.loginPage}>
        <Head>
            <title>Echo - Login</title>
            <meta name="description" content="A simple social media." />
            <link rel="icon" href="/favicon.ico" />
            { activeUser ? <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} /> : null}
        </Head>
            <div className={styles.loginHeader}>
                <img src={`/images/logo.png`} alt="logo" className={styles.loginHeaderLogo} />
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
            </div>

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null }
        </div>
    )
}