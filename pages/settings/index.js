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
import { nickDict } from '../../services/generators/NIckGenerator'

export default function ProfileSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [userAccount, setUserAccount] = useState(activeUser)
    const [updatedData, setUpdatedData] = useState({
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        nickname: activeUser.nickname,
        email: activeUser.email,
        dateOfBirth: activeUser.dateOfBirth,
        phone: "",
        country: "Nigeria",
        state: "Lagos",
        city: "Lagos",
        bio: "",
        gender: "None",
        occupation: "",
        maritalStatus: "Single",
        fSocial: "",
        tSocial: "",
        iSocial: ""
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(true)
    const {socket, socketMethods} = useSocketContext()

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        const getAccount = (data) => {
            if (data.success) {
                setUserAccount(data.data)
                setUpdatedData({...updatedData, ...data.data})
            }
        }
        if (activeUser.accountID) {
            if (socket) socketMethods.socketRequest("GET_ACCOUNT", { accountID: activeUser.accountID }, getAccount)
        }
    }, [socket])

    const handleSubmit = async () => {
        if (socket) socketMethods.socketEmitter("UPDATE_ACCOUNT", updatedData)
        createAlert("success", "Settings updated successfully.")
        setActiveUser({...activeUser, ...updatedData})
        Cache.saveData("EchoUser", {...activeUser, ...updatedData})
    }

    const handleRevert = () => {
        setUpdatedData(userAccount)
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

                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)" }} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                                <>
                                    <span className={styles.settingsBodySubNavButton} style={{ color: "var(--accent)" }} onClick={() => router.push("/settings")}>Profile Info</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/nodes")}>Hobbies and Interests</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/cp")}>Change/Reset Password</span>
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
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Profile Information</span>
                            <div className={styles.formContainerForm}>
                                <Form.TextInput
                                    label="First Name"
                                    style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                                    value={updatedData.firstName}
                                    onChange={(e) => setUpdatedData({ ...updatedData, firstName: e.target.value })}
                                />
                                <Form.TextInput
                                    label="Last Name"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={updatedData.lastName}
                                    onChange={(e) => setUpdatedData({ ...updatedData, lastName: e.target.value })}
                                />
                                <Form.TextInput
                                    label="Nickname"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={updatedData.nickname}
                                    onChange={(e) => setUpdatedData({ ...updatedData, nickname: e.target.value })}
                                    placeholder="A fun nickname for yourself."
                                />
                                <Form.TextInput
                                    label="Email"
                                    style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                                    value={updatedData.email}
                                    onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                                />
                                <Form.SelectSingleInput
                                    label="Gender"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={updatedData.gender}
                                    setValue={(value) => setUpdatedData({ ...updatedData, gender: value })}
                                    options={[
                                        { label: "Male", value: "Male" },
                                        { label: "Female", value: "Female" },
                                        { label: "Non Binary", value: "Non Binary" },
                                        { label: "Prefer not to say", value: "None" }
                                    ]}
                                />
                                <Form.DateInput
                                    label="Birthday"
                                    style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                                    value={updatedData.dateOfBirth}
                                    onChange={(e) => setUpdatedData({ ...updatedData, dateOfBirth: e.target.value })}
                                />
                                <Form.TextInput
                                    label="Phone"
                                    style={{ width: "calc(33.33% - 14px)", float: "left", marginBottom: "20px" }}
                                    value={updatedData.phone}
                                    onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
                                    placeholder="Your phone number."
                                />
                                <Form.SelectSingleInput
                                    label="Country"
                                    style={{ width: "calc(33.33% - 14px)", float: "left", marginBottom: "20px", marginLeft: "20px" }}
                                    value={updatedData.country}
                                    setValue={(value) => setUpdatedData({ ...updatedData, country: value })}
                                    options={[
                                        { label: "Nigeria", value: "Nigeria" },
                                        { label: "Ghana", value: "Ghana" },
                                        { label: "Cameroon", value: "Cameroon" },
                                        { label: "Niger", value: "Niger" }
                                    ]}
                                />
                                <Form.SelectSingleInput
                                    label="City"
                                    style={{ width: "calc(33.33% - 14px)", float: "right", marginBottom: "20px", marginLeft: "20px" }}
                                    value={updatedData.city}
                                    setValue={(value) => setUpdatedData({ ...updatedData, city: value })}
                                    options={[
                                        { label: "Lagos", value: "Lagos" },
                                        { label: "Abeokuta", value: "Abeokuta" },
                                        { label: "Akure", value: "Akure" },
                                        { label: "Ibadan", value: "Ibadan" },
                                    ]}
                                />
                                <Form.AreaInput
                                    label="Bio"
                                    style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                                    value={updatedData.bio}
                                    onChange={(e) => setUpdatedData({ ...updatedData, bio: e.target.value })}
                                    placeholder="A few words about you."
                                />
                                <Form.TextInput
                                    label="Occupation"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={updatedData.occupation}
                                    onChange={(e) => setUpdatedData({ ...updatedData, occupation: e.target.value })}
                                    placeholder="What do you do?"
                                />
                                <Form.SelectSingleInput
                                    label="Marital Status"
                                    style={{ width: "calc(50% - 10px)", float: "right", marginBottom: "20px" }}
                                    value={updatedData.maritalStatus}
                                    setValue={(value) => setUpdatedData({ ...updatedData, maritalStatus: value })}
                                    options={[
                                        { label: "Single", value: "Single" },
                                        { label: "Married", value: "Married" },
                                        { label: "Divorced", value: "Divorced" },
                                        { label: "It's Complicated", value: "It's Complicated" }
                                    ]}
                                />
                                <Form.TextInput
                                    label="Facebook"
                                    style={{ width: "100%", float: "right", marginBottom: "20px" }}
                                    value={updatedData.fSocial}
                                    onChange={(e) => setUpdatedData({ ...updatedData, fSocial: e.target.value })}
                                    placeholder="Link your Facebook page."
                                />
                                <Form.TextInput
                                    label="X"
                                    style={{ width: "100%", float: "right", marginBottom: "20px" }}
                                    value={updatedData.tSocial}
                                    onChange={(e) => setUpdatedData({ ...updatedData, tSocial: e.target.value })}
                                    placeholder="Link your X page."
                                />
                                <Form.TextInput
                                    label="Instagram"
                                    style={{ width: "100%", float: "right", marginBottom: "20px" }}
                                    value={updatedData.iSocial}
                                    onChange={(e) => setUpdatedData({ ...updatedData, iSocial: e.target.value })}
                                    placeholder="Link your Instagram page."
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