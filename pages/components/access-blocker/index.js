import React from "react";
import SVGServer from "../../../services/svg/svgServer";
import styles from "./access-blocker.module.css"

export default function AccessBlocker({icon, title, message, buttonText, buttonCallback}) {
    return(
        <>
            <div className={styles.accessBlockerOverlay}>
                <div className={styles.accessBlocker}>
                    <span className={styles.accessBlockerIcon}>
                        { icon === "key" ? <SVGServer.KeyIcon color="var(--primary)" width="30px" height="30px" /> : null }
                        { icon === "block" ? <SVGServer.BlockIcon color="var(--primary)" width="30px" height="30px" /> : null }
                    </span>
                    <span className={styles.accessBlockerTitle}>{title}</span>
                    <span className={styles.accessBlockerMessage}>{message}</span>
                    <button className={styles.accessBlockerButton} onClick={() => buttonCallback()}>{buttonText}</button>
                </div>
            </div>
        </>
    )
}