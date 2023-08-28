import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "./settings.module.css"
import { useRouter } from 'next/router'

import Cache from '../../services/CacheService'
import Modals from '../components/modals';
import SVGServer from '../../services/svg/svgServer'

import ProfileForm from './forms/profile'
import ChangePasswordForm from './change-password'
import NotificationsForm from './forms/notifications'
import FeedForm from './forms/feed'
import PrivacyForm from './forms/privacy'
import MessagingForm from './forms/messaging'
import PreferencesForm from './forms/preferences'
import NodesForm from './forms/nodes'
import useModalStates from '../hooks/useModalStates'
import { useSocketContext } from '../../util/SocketProvider'

export default function Settings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(false)
    const {socket, socketMethods} = useSocketContext()

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "Settings",
        router,
        cache: Cache,
        activeUser,
        setActiveUser,
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
                <link rel="stylesheet" href={`/styles/themes/${activeUser.dark ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.settingsHead}></div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingsBodyNav}>
                        <span className={styles.settingsBodyNavTitle}>Settings</span>

                        <div className={styles.settingsBodyNavButton} style={{backgroundColor: (["Profile", "Preferences", "Hobbies", "CRP"]).includes(activePage) ? "var(--base)" : null}} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                            <>
                            <span className={styles.settingsBodySubNavButton} style={{color: activePage === "profile" ? "var(--accent)" : null}} onClick={() => setActivePage("profile")}>Profile Info</span>
                            <span className={styles.settingsBodySubNavButton} style={{color: activePage === "preferences" ? "var(--accent)" : null}} onClick={() => setActivePage("preferences")}>Preferences</span>
                            <span className={styles.settingsBodySubNavButton} style={{color: activePage === "hobbies" ? "var(--accent)" : null}} onClick={() => setActivePage("nodes")}>Hobbies and Interests</span>
                            <span className={styles.settingsBodySubNavButton} style={{color: activePage === "cp" ? "var(--accent)" : null}} onClick={() => setActivePage("cp")}>Change/Reset Password</span>
                            </> : null
                        }
                        <div className={styles.settingsBodyNavButton} style={{backgroundColor: activePage === "privacy" ? "var(--base)" : null}} onClick={() => setActivePage("privacy")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.PrivacyIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Privacy</span>
                        </div>
                        <div className={styles.settingsBodyNavButton}style={{backgroundColor: activePage === "feed" ? "var(--base)" : null}} onClick={() => setActivePage("feed")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.FeedIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Feed</span>
                        </div>
                        <div className={styles.settingsBodyNavButton}style={{backgroundColor: activePage === "notifications" ? "var(--base)" : null}} onClick={() => setActivePage("notifications")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.NotificationIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Notifications</span>
                        </div>
                        <div className={styles.settingsBodyNavButton}style={{backgroundColor: activePage === "messaging" ? "var(--base)" : null}} onClick={() => setActivePage("messaging")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ChatIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Chat & Messaging</span>
                        </div>
                    </div>
                    <div className={styles.settingsBodyContent}>
                        { activePage === "profile" ? <ProfileForm page={pageControl} /> : null }
                        { activePage === "cp" ? <ChangePasswordForm page={pageControl} /> : null }
                        { activePage === "notifications" ? <NotificationsForm page={pageControl} /> : null }
                        { activePage === "feed" ? <FeedForm page={pageControl} /> : null }
                        { activePage === "privacy" ? <PrivacyForm page={pageControl} /> : null }
                        { activePage === "messaging" ? <MessagingForm page={pageControl} /> : null }
                        { activePage === "preferences" ? <PreferencesForm page={pageControl} /> : null }
                        { activePage === "nodes" ? <NodesForm page={pageControl} /> : null }
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}