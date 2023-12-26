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
import Helpers from '../../util/Helpers'

export default function BlacklistSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [blacklists, setBlacklists] = useState([])
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(false)
    
    const [blacklistLoader, setBlacklistLoader] = useState(true)
    const [blacklistPage, setBlacklistPage] = useState(1)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        const updateBlacklists = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setBlacklists, data.pagination, "accountID")
                setPagination(data.pagination)
            } else createAlert("error", data.message)
            setBlacklistLoader(false)
        }
        if (activeUser.accountID) {
            APIClient.get(APIClient.routes.getBlacklist, {
                accountID: activeUser.accountID,
                blocker: activeUser.accountID,
                page: blacklistPage,
                pageSize: 10
            }, updateBlacklists)
        }
    }, [blacklistPage])

    const handleLiftBan = async (blockee) => {
        APIClient.del(APIClient.routes.deleteBlacklist, {
            accountID: activeUser.accountID,
            blocker: activeUser.accountID,
            blockee
        })
        setBlacklists(blacklists.filter((obj) => obj.blockee !== blockee))
        createAlert("success", "Ban lifted succesfully.")
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

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && blacklistPage < pagination.totalPages && !blacklistLoader) {
            setBlacklistPage(blacklistPage + 1);
            setBlacklistLoader(true)
        }
    };

    return (
        <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
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
                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)"}} onClick={() => router.push("/settings/blacklist")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.BlockIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Blacklist</span>
                        </div>
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Blacklists</span>
                            <div className={styles.formContainerForm}>
                            {
                                blacklists.length > 0 ?
                                    blacklists.map((blacklist, index) => 
                                        <div className={styles.blacklist} key={index} style={{backgroundColor: "var(--base)"}}>
                                            <div className={styles.blacklistProfile} style={{backgroundImage: `url(${blacklist.profileImage.url})`}}></div>
                                            <span className={styles.blacklistName} style={{color: "var(--primary)"}}>{blacklist.firstName} {blacklist.lastName}</span>
                                            <div className={styles.blacklistOptions}>
                                                <SVGServer.OptionIcon color="var(--primary)" width="20px" height="20px" />
                                                <div className={styles.blacklistOptionsDrop}>
                                                    <span className={styles.blacklistOption} onClick={() => handleLiftBan(blacklist.blockee)}>Remove from blacklist</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                : <span style={{fontSize: "15px", fontWeight: "200", color: "var(--primary)"}}>There are currently no blacklisted users to view.</span>
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}