import React, { useState, useEffect } from "react";
import AppConfig from "../../../util/config";
import styles from "./bottomnav.module.css"

import SVGServer from "../../../services/svg/svgServer";
import APIClient from "../../../services/APIClient";
import AccountNav from "../accountnav";
import Search from "../search";

export default function BottomNav({ page }) {

    return (
        <div className={styles.bottomnavContainer}>
            <div className={styles.bottomNavButton}>
                <span className={styles.bottomNavButtonIcon} onClick={() => page.router.push("/")}>
                    <SVGServer.FeedIcon color="var(--primary)" width="100%" height="100%" />
                </span>
                <span className={styles.bottomNavButtonName}>Feed</span>
            </div>
            <div className={styles.bottomNavButton}>
                <span className={styles.bottomNavButtonIcon} onClick={() => page.router.push("/communities")}>
                    <SVGServer.CommunityIcon color="var(--primary)" width="100%" height="100%" />
                </span>
                <span className={styles.bottomNavButtonName}>Communities</span>
            </div>
            <div className={styles.bottomNavButton}>
                <span className={styles.bottomNavButtonIcon} onClick={() => page.router.push("/people")}>
                    <SVGServer.PeopleIcon color="var(--primary)" width="100%" height="100%" />
                </span>
                <span className={styles.bottomNavButtonName}>People</span>
            </div>
            <div className={styles.bottomNavButton}>
                <span className={styles.bottomNavButtonIcon} onClick={() => page.setShowMessenger(true)}>
                    <SVGServer.ChatIcon color="var(--primary)" width="100%" height="100%" />
                </span>
                <span className={styles.bottomNavButtonName}>Messages</span>
            </div>
            <div className={styles.bottomNavButton}>
                <span className={styles.bottomNavButtonIcon} onClick={() => page.router.push(`/user/${page.activeUser.accountID}`)}>
                    <SVGServer.ProfileIcon color="var(--primary)" width="100%" height="100%" />
                </span>
                <span className={styles.bottomNavButtonName}>Me</span>
            </div>
        </div>
    )
}