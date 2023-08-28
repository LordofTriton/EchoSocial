import React, { useState, useEffect } from "react";
import AppConfig from "../../../util/config";
import styles from "./topnav.module.css"

import SVGServer from "../../../services/svg/svgServer";
import APIClient from "../../../services/APIClient";
import AccountNav from "../accountnav";

export default function TopNav({ page }) {
    const [userNotifications, setUserNotifications] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [openAccountNav, setOpenAccountNav] = useState(false)

    useEffect(() => {
        if (!page.socket) return;
        const updateNotifications = (data) => { setUserNotifications((state) => [data, ...state]) }
        page.socketMethods.socketListener("NEW_NOTIFICATION", updateNotifications)
    }, [page.socket]);

    useEffect(() => {
        if (page.socket) {
            const updateNotifications = (data) => {
                if (data.success) setUserNotifications((state) => state.concat(data.data))
            }
            page.socketMethods.socketRequest("GET_NOTIFICATIONS", {
                accountID: page.activeUser.accountID,
                page: 1,
                pageSize: 10
            }, updateNotifications)
        }
    }, [page.socket])

    return (
        <>
            <AccountNav toggle={openAccountNav} control={setOpenAccountNav} page={page} />
            <div className={styles.topnavContainer}>
                <span className={styles.topnavTitle}>{page.title.toUpperCase()}</span>
                <div className={styles.topnavSearchBar}>
                    <form>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search people, echoes, and communities..." />
                    </form>
                </div>
                <div className={styles.topnavAccount} onMouseEnter={() => setOpenAccountNav(true)} onMouseLeave={() => setOpenAccountNav(false)}>
                    <div className={styles.topnavProfileImage} style={{ backgroundImage: page.activeUser.profileImage.url ? `url(${page.activeUser.profileImage.url})` : `url(/images/profile.jpg)` }}>
                        <div className={styles.topnavProfileImageActive}></div>
                    </div>
                    <div className={styles.topnavAccountData}>
                        <span className={styles.topnavAccountName}>{
                            page.activeUser?.firstName && page.activeUser?.lastName ? `${page.activeUser.firstName} ${page.activeUser.lastName}` : ""
                        }</span>
                        <span className={styles.topnavAccountNickName}>{
                            page.activeUser?.nickname ? page.activeUser.nickname : "Overlord"
                        }</span>
                    </div>
                </div>
                <div className={styles.topnavButton} onClick={() => page.setShowNotifications(true)}>
                    <SVGServer.NotificationIcon color="currentColor" dotColor={userNotifications.filter((notification) => notification.status === "unread").length > 0 ? "var(--accent)" : "var(--surface)"} width="40px" height="40px" />
                </div>
                <div className={styles.topnavButton} style={{ paddingTop: "18px" }} onClick={() => page.setShowEchoCreator(true)}>
                    <SVGServer.CreatePostIcon color="currentColor" width="35px" height="35px" />
                </div>
                <div className={styles.topnavButton} style={{ paddingTop: "20px", marginRight: "5px" }}>
                    <SVGServer.ChatIcon color="currentColor" width="35px" height="35px" />
                </div>
            </div>
        </>
    )
}