import React, { useState, useEffect } from "react";
import AppConfig from "../../../util/config";
import styles from "./topnav.module.css"

import SVGServer from "../../../services/svg/svgServer";
import APIClient from "../../../services/APIClient";
import AccountNav from "../accountnav";
import Search from "../search";
import Helpers from "../../../util/Helpers";
import PusherClient from "../../../services/PusherClient";
import pusherJs from "pusher-js";

export default function TopNav({ page }) {
    const [userNotifications, setUserNotifications] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState(null)
    const [openAccountNav, setOpenAccountNav] = useState(false)

    useEffect(() => {
        PusherClient.subscribe(page.activeUser.accountID).bind(`NEW_NOTIFICATION`, (data) => { setUserNotifications((state) => [data, ...state]) });
    }, []);

    useEffect(() => {
        const updateNotifications = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserNotifications, data.pagination, "notificationID")
                if (data.data.filter((notification) => notification.status === "unread").length > 0) page.setShowNotificationDot(true)
            } else page.createAlert("error", data.message)
        }
        APIClient.get(APIClient.routes.getNotifications, {
            accountID: page.activeUser.accountID,
            page: 1,
            pageSize: 10
        }, updateNotifications)
    }, [])

    return (
        <>
            <AccountNav toggle={openAccountNav} control={setOpenAccountNav} page={page} />
            <div className={styles.topnavContainer}>
                <img className={styles.topnavLogo} src={`/images/newLogoTransparent.png`} alt="logo" onClick={() => page.router.push("/")} />
                <span className={styles.topnavTitle}>{page.title.toUpperCase()}</span>
                <div className={styles.topnavSearchBar} onClick={() => page.setShowSearch(true)}>
                    <form>
                        <input id="searchButton" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search people, echoes, and communities..." />
                    </form>
                </div>
                <div className={styles.topnavAccount} onMouseEnter={() => setOpenAccountNav(true)} onMouseLeave={() => setOpenAccountNav(false)} onClick={() => page.setShowSidenav(true)}>
                    <div className={styles.topnavProfileImage} style={{ backgroundImage: page.activeUser?.profileImage.url ? `url(${page.activeUser?.profileImage.url})` : `url(/images/userProfile.png)` }}>
                        <div className={styles.topnavProfileImageActive}></div>
                    </div>
                    <div className={styles.topnavAccountData}>
                        <span className={styles.topnavAccountName}>{
                            page.activeUser?.firstName && page.activeUser?.lastName ? `${page.activeUser?.firstName} ${page.activeUser?.lastName}` : ""
                        }</span>
                        <span className={styles.topnavAccountNickName}>{
                            page.activeUser?.nickname ? page.activeUser?.nickname : "Astronaut"
                        }</span>
                    </div>
                </div>
                <div className={styles.topnavButton} onClick={() => page.setShowNotifications(true)}>
                    <SVGServer.NotificationIcon color="currentColor" dotColor={page.showNotificationDot ? "var(--accent)" : "var(--surface)"} width="40px" height="40px" />
                </div>
                <div className={styles.topnavButton} style={{ paddingTop: "18px" }} onClick={() => page.setShowEchoCreator(true)}>
                    <SVGServer.CreatePostIcon color="currentColor" width="35px" height="35px" />
                </div>
                <div id="searchButton" className={`${styles.topnavButton} ${styles.topnavSearchButton}`} style={{ paddingTop: "20px", marginRight: "5px" }} onClick={() => page.setShowSearch(true)}>
                    <SVGServer.SearchIcon color="currentColor" width="35px" height="35px" />
                </div>
                <div id="chatButton" className={`${styles.topnavButton} ${styles.topnavChatButton}`} style={{ paddingTop: "20px", marginRight: "5px" }} onClick={() => page.setShowMessenger(true)}>
                    <SVGServer.ChatIcon color="currentColor" width="35px" height="35px" />
                </div>
            </div>
        </>
    )
}