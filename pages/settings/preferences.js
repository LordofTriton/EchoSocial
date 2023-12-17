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

export default function PreferencesSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userSettings, setUserSettings] = useState(null)
    const [updatedSettings, setUpdatedSettings] = useState({
        followable: true,
        dark: false,
        language: "English (U.S)"
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(true)
    const { sse, sseListener, sseDeafener } = useSSEContext()

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        const getSettings = (data) => {
            if (data.success) {
                setUserSettings(data.data)
                setUpdatedSettings({...updatedSettings, ...data.data})
            }
        }
        if (activeUser.accountID) {
            APIClient.get(APIClient.routes.getSettings, { accountID: activeUser.accountID }, getSettings)
        }
    }, [])

    const handleSubmit = async () => {
        APIClient.post(APIClient.routes.updateSettings, updatedSettings)
        createAlert("success", "Settings updated successfully.")
    }

    const handleRevert = () => {
        setUpdatedSettings(userSettings)
    }

    const themeChange = (dark) => {
        setUpdatedSettings({ ...updatedSettings, dark })
        CacheService.saveData("EchoActiveUser", { ...activeUser, dark })
        localStorage.setItem("EchoTheme", dark)
        setActiveTheme(dark)
        setActiveUser({ ...activeUser, dark })
        APIClient.post(APIClient.routes.updateSettings, {
            accountID: activeUser.accountID,
            dark
        })
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
        sse,
        sseListener,
        sseDeafener,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl,
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
                                    <span className={styles.settingsBodySubNavButton} style={{ color: "var(--accent)"}} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/nodes")}>Nodes</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/change-password")}>Change/Reset Password</span>
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
                            <span className={styles.formContainerTitle}>Preferences</span>
                            <div className={styles.formContainerForm}>
                                <div className={styles.formContainerFormSwitchBar}>
                                    <Form.SwitchInput
                                        value={updatedSettings.dark}
                                        style={{ float: "left" }}
                                        onChange={(value) => themeChange(value)}
                                    />
                                    <span className={styles.formContainerFormSwitchBarText}>Dark Mode<br /><span>You know what dark mode is.</span></span>
                                </div>
                                <div className={styles.formContainerFormSwitchBar}>
                                    <Form.SwitchInput
                                        value={updatedSettings.followable}
                                        style={{ float: "left" }}
                                        onChange={(value) => setUpdatedSettings({ ...updatedSettings, followable: value })}
                                    />
                                    <span className={styles.formContainerFormSwitchBarText}>Followable<br /><span>Allow people to follow you.</span></span>
                                </div>
                                <Form.SelectSingleInput
                                    label="Language"
                                    style={{ width: "50%", float: "left", marginTop: "20px", border: "1px solid var(--alt);" }}
                                    value={updatedSettings.language}
                                    setValue={(value) => setUpdatedSettings({ ...updatedSettings, language: value })}
                                    options={[
                                        { label: "English", value: "English" },
                                        { label: "French", value: "French" },
                                        { label: "Spanish", value: "Spanish" }
                                    ]}
                                />
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