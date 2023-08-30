import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "./settings.module.css"
import { useRouter } from 'next/router'

import Cache from '../../services/CacheService'
import Modals from '../components/modals';
import SVGServer from '../../services/svg/svgServer'
import APIClient from "../../services/APIClient";
import { Form } from "../components/form";
import useModalStates from '../hooks/useModalStates'
import { useSocketContext } from '../../util/SocketProvider'

export default function FeedSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [userSettings, setUserSettings] = useState(null)
    const [updatedSettings, setUpdatedSettings] = useState({
        safeSearch: true,
        seeEchoRecs: true
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        if (socket) {
            const getSettings = (data) => {
                if (data.success) {
                    setUserSettings(data.data)
                    setUpdatedSettings({...updatedSettings, ...data.data})
                }
            }
            if (activeUser.accountID) {
                if (socket) socketMethods.socketRequest("GET_SETTINGS", { accountID: activeUser.accountID }, getSettings)
            }
        }
    }, [socket])

    const handleSubmit = async () => {
        if (socket) socketMethods.socketEmitter("UPDATE_SETTINGS", updatedSettings)
        createAlert("success", "Settings updated successfully.")
    }

    const handleRevert = () => {
        setUpdatedSettings(userSettings)
    }

    const pageControl = {
        title: "Settings",
        router,
        cache: Cache,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        socket,
        socketMethods,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl
    }

    return (
        <div className="page" style={{backgroundColor: "var(--base)"}}>
            <Head>
                <title>Echo - Settings</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.settingsHead}></div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingsBodyNav}>
                        <span className={styles.settingsBodyNavTitle}>Settings</span>

                        <div className={styles.settingsBodyNavButton} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                                <>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings")}>Profile Info</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/nodes")}>Hobbies and Interests</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/cp")}>Change/Reset Password</span>
                                </> : null
                        }
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/privacy")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.PrivacyIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Privacy</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)"}} onClick={() => router.push("/settings/feed")}>
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
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Feed</span>
                            <div className={styles.formContainerForm}>
                                <div className={styles.formContainerFormSwitchBar}>
                                    <Form.SwitchInput
                                        value={updatedSettings.seeEchoRecs}
                                        style={{ float: "left" }}
                                        onChange={(value) => setUpdatedSettings({ ...updatedSettings, seeEchoRecs: value })}
                                    />
                                    <span className={styles.formContainerFormSwitchBarText}>Echo Recommendations<br /><span>Shows you content you might like based on your activity.</span></span>
                                </div>
                                <div className={styles.formContainerFormButtons}>
                                    <button className={styles.formContainerFormRevertHalf} onClick={() => handleRevert()}>Revert Changes</button>
                                    <button className={styles.formContainerFormSubmitHalf} onClick={() => handleSubmit()}>Save Changes</button>
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