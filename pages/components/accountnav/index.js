import React, { useState, useEffect } from "react";
import styles from './accountnav.module.css';

import SVGServer from "../../../services/svg/svgServer";
import Form from "../form";

export default function AccountNav({toggle, control, page}) {
    const handleLogout = () => {
        page.cache.deleteData("EchoUser");
        page.router.push("/login")
    }

    const themeChange = (dark) => {
        page.cache.saveData("EchoUser", { ...page.activeUser, dark })
        page.setActiveUser({ ...page.activeUser, dark })
        if (page.socket) page.socketMethods.socketEmitter("UPDATE_SETTINGS", {
            accountID: page.activeUser.accountID,
            dark
        })
    }

    return (
        <div className={styles.accountNavContainer} style={{top: toggle ? "70px" : "-100vh"}} onMouseEnter={() => control(true)} onMouseLeave={() => control(false)}>
            <span className={styles.accountNavTitle}>My Account</span>
            <div className={styles.accountNavButton} onClick={() => page.router.push(`/user/${page.activeUser.accountID}`)}>
                <span className={styles.accountNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Profile</span>
            </div>
            <div className={styles.accountNavButton} onClick={() => page.router.push(`/settings`)}>
                <span className={styles.accountNavButtonIcon}><SVGServer.SettingsIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Settings</span>
            </div>
            <div className={styles.accountNavButton}>
                <Form.SwitchInput
                    value={page.activeUser.dark}
                    style={{ float: "left" }}
                    onChange={(value) => themeChange(value)}
                />
                <span className={styles.accountNavButtonText}>Dark Mode</span>
            </div>
            <hr />
            <div className={styles.accountNavButton} onClick={() => page.router.push("/communities?create=true")}>
                <span className={styles.accountNavButtonIcon}><SVGServer.AltCommunityIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Create Community</span>
            </div>
            <div className={styles.accountNavButton} onClick={() => page.router.push("/communities/discover")}>
                <span className={styles.accountNavButtonIcon}><SVGServer.CommunityIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Explore Communities</span>
            </div>
            <hr />
            <div className={styles.accountNavButton}onClick={() => page.router.push("/help")}>
                <span className={styles.accountNavButtonIcon}><SVGServer.HelpIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Help Center</span>
            </div>
            <div className={styles.accountNavButton}>
                <span className={styles.accountNavButtonIcon}><SVGServer.TAndCIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Terms and Conditions</span>
            </div>
            <hr />
            <div className={styles.accountNavButton} onClick={() => handleLogout()}>
                <span className={styles.accountNavButtonIcon}><SVGServer.LogoutIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.accountNavButtonText}>Log Out</span>
            </div>
        </div>
    )
}