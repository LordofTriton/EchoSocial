import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "./settings.module.css"
import { useRouter } from 'next/router'

import CacheService from '../../services/CacheService'
import Modals from '../components/modals';
import SVGServer from '../../services/svg/svgServer'
import APIClient from "../../services/APIClient";
import { Form } from "../components/form";
import useModalStates from '../hooks/useModalStates'
import { useSSEContext } from '../../util/SocketProvider'
import useDataStates from '../hooks/useDataStates'

export default function ChangePasswordSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userAccount, setUserAccount] = useState(activeUser)
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(true)
    
    const [loading, setLoading] = useState(false)

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const handleSubmit = async () => {
        APIClient.post(APIClient.routes.changePassword, {
            accountID: activeUser.accountID,
            ...passwords
        })
        createAlert("success", "Password changed successfully.")
    }

    const pageControl = {
        title: "Settings",
        router,
        cookies: CacheService,
        cache: CacheService,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl,
    }

    const isValidData = () => {
        if (passwords.oldPassword.trim().length < 6) return false;
        if (passwords.newPassword.trim().length < 6) return false;
        if (passwords.newPassword !== passwords.confirmNewPassword) return false;
    }

    return (
        <div className="page" style={{backgroundColor: "var(--base)"}}>
            <Head>
                <title>Echo - Settings</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.settingsHead}></div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingsBodyNav}>
                        <span className={styles.settingsBodyNavTitle}>Settings</span>

                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)" }} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                                <>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings")}>Profile Info</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/nodes")}>Nodes</span>
                                    <span className={styles.settingsBodySubNavButton} style={{ color: "var(--accent)" }} onClick={() => router.push("/settings/change-password")}>Change/Reset Password</span>
                                </> : null
                        }
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/privacy")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.PrivacyIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Privacy</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/feed")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.FeedIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Feed</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/notifications")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.NotificationIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Notifications</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/messaging")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ChatIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Chat & Messaging</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/blacklist")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.BlockIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Blacklist</span>
                        </div>
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Change Password</span>
                            <div className={styles.formContainerForm}>
                                <Form.TextInput
                                    type="password"
                                    label="Current Password"
                                    style={{ width: "100%", float: "left", marginBottom: "20px" }}
                                    value={passwords.oldPassword}
                                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                    isValid={(value) => value.trim().length > 6}
                                    error="Please enter your current password."
                                />
                                <Form.TextInput
                                    type="password"
                                    label="New Password"
                                    style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    isValid={(value) => value.trim().length > 6}
                                    error="Password must be at least 6 characters long."
                                />
                                <Form.TextInput
                                    type="password"
                                    label="Confirm New Password"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={passwords.email}
                                    onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                                    isValid={(value) => value === passwords.newPassword}
                                    error="Password don't match."
                                />
                                <div className={styles.formContainerFormButtons}>
                                    <button className={styles.formContainerFormSubmitFull} style={{opacity: isValidData() ? "1" : "0.5"}} onClick={() => isValidData() ? handleSubmit() : null}>Change Password</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}