import React from "react";
import SVGServer from "../../../services/svg/svgServer";
import styles from "./alert.module.css"

export default function Alert({type, message, control}) {
    const colors = {
        error: "red",
        success: "lime"
    }
    
    return(
        <div className={styles.alertContainer} style={{backgroundColor: colors[type]}}>
            <div className={styles.alertContent}>
                <span className={styles.alertIcon}>
                    {type === "error" ? <SVGServer.ErrorIcon color="white" width="25px" height="25px" /> : null}
                    {type === "success" ? <SVGServer.CheckIcon color="white" width="25px" height="25px" /> : null}
                </span>
                <span className={styles.alertMessage}>{message}</span>
            </div>
        </div>
    )
}