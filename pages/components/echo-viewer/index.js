import React, { useEffect, useState } from "react";
import styles from "./echo-viewer.module.css"

import SVGServer from "../../../services/svg/svgServer";
import Echo from "../echo";

export default function EchoViewer({ data, control, page }) {
    const [echoData, setEchoData] = useState(data)

    useEffect(() => {
        setEchoData(data);
    }, [data])

    return (
        <>
            <div className="modalOverlay" style={{ display: echoData ? "block" : "none" }} onClick={() => control(false)}></div>
            <div className={styles.echoViewerEchoContainer} style={{ right: !echoData ? "-700px" : null }}>
                <div className={`${styles.echoViewerContainerHead} ${styles.echoViewerEchoHead}`}>
                    <span className={styles.echoViewerContainerHeadTitle}><span className="titleGradient">Echo</span></span>
                    <span className={styles.echoViewerContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
                </div>
                <div className={styles.echoViewerEcho}>{echoData ? <Echo data={echoData} page={page} fullText={true} /> : null}</div>
            </div>
        </>
    )
}