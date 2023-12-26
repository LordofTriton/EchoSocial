import React from "react";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import { Form } from "../form";
import styles from "./sidenav.module.css"

export default function SideNav({toggle, control, page}) {
    const handleLogout = () => {
        page.cookies.deleteData("EchoUser");
        localStorage.clear()

        page.router.push("/login")
    }

    const themeChange = (dark) => {
        page.cookies.saveData("EchoUser", { ...page.activeUser, dark })
        page.setActiveUser({ ...page.activeUser, dark })
        localStorage.setItem("EchoTheme", dark)
        page.setActiveTheme(dark)
        APIClient.post(APIClient.routes.updateSettings, {
            accountID: page.activeUser.accountID,
            dark
        })
    }

    return(
        <div className={styles.sidenavContainer} style={{right: !toggle ? "-100vw" : null}}>
            <span className={styles.sidenavClose} onClick={() => control(false)}><SVGServer.CloseIcon color="var(--accent)" width="50px" height="50px" /></span>

            <div className={styles.sidenavButtons}>
            <div className={styles.sidenavButton} onClick={() => page.router.push(`/user/${page.activeUser?.accountID}`)}>
                <span className={styles.sidenavButtonMirage}><SVGServer.ProfileIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Profile</span>
            </div>
            <div className={styles.sidenavButton} onClick={() => page.router.push(`/settings`)}>
                <span className={styles.sidenavButtonMirage}><SVGServer.SettingsIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.SettingsIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Settings</span>
            </div>
            <div className={styles.sidenavButton}>
                <span className={styles.sidenavButtonMirage}><SVGServer.DarkIcon color="var(--alt)" width="100px" height="100px" /></span>
                <Form.SwitchInput
                    value={page.activeTheme === "dark"}
                    style={{ float: "right" }}
                    onChange={(value) => themeChange(value ? "dark" : "light")}
                />
                <span className={styles.sidenavButtonText}>Dark Mode</span>
            </div>
            <hr />
            <div className={styles.sidenavButton} onClick={() => page.router.push("/communities?create=true")}>
                <span className={styles.sidenavButtonMirage}><SVGServer.AltCommunityIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.AltCommunityIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Create Community</span>
            </div>
            <div className={styles.sidenavButton} onClick={() => page.router.push("/communities/discover")}>
                <span className={styles.sidenavButtonMirage}><SVGServer.CommunityIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.CommunityIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Explore Communities</span>
            </div>
            <hr />
            <div className={styles.sidenavButton}onClick={() => page.router.push("/help")}>
                <span className={styles.sidenavButtonMirage}><SVGServer.HelpIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.HelpIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Help Center</span>
            </div>
            <div className={styles.sidenavButton}>
                <span className={styles.sidenavButtonMirage}><SVGServer.TAndCIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.TAndCIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Terms and Conditions</span>
            </div>
            <hr />
            <div className={styles.sidenavButton} onClick={() => handleLogout()}>
                <span className={styles.sidenavButtonMirage}><SVGServer.LogoutIcon color="var(--alt)" width="100px" height="100px" /></span>
                <span className={styles.sidenavButtonIcon}><SVGServer.LogoutIcon color="var(--secondary)" width="30px" height="30px" /></span>
                <span className={styles.sidenavButtonText}>Log Out</span>
            </div>
            </div>
        </div>
    )
}