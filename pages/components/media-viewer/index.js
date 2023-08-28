import React, { useEffect, useState } from "react";
import styles from "./media-viewer.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";

export default function MediaViewer({ data, control, page }) {
    const [mediaData, setMediaData] = useState(data)
    const [mediaIndex, setMediaIndex] = useState(0)

    useEffect(() => {
        if (data) setMediaData(data)
        else {
            setMediaIndex(0)
            setMediaData(null)
        }
    }, [data])

    const getCurrentMedia = () => {
        return mediaData.content.media[mediaIndex].url;
    }

    return (
        <>
        <div className="modalOverlay" style={{display: mediaData ? "block" : "none"}} onClick={() => control(null)}></div>
        <div className={styles.mediaViewerContainer} style={{right: mediaData ? "100px" : "-100%"}}>
            {
                mediaData ?
                <>
                <div className={styles.mediaViewerHead}>
                    {
                        mediaData.communityID && !page.community ?
                        <>
                        <div className={styles.mediaViewerHeadProfile} style={{ backgroundImage: `url(${mediaData.communityData.profileImage.url})` }} onClick={() => page.router.push(`/communities/${mediaData.communityID}`)}></div>
                        <span className={styles.mediaViewerHeadData}>
                            <span className={styles.mediaViewerHeadDataUser} onClick={() => page.router.push(`/communities/${mediaData.communityID}`)}>{`${mediaData.communityData.name}`}</span>
                            <span className={styles.mediaViewerHeadDataDateTime}><span onClick={() => page.router.push(`/user/${mediaData.accountID}`)}>{`${mediaData.userData.firstName} ${mediaData.userData.lastName}`}<span></span></span>{DateGenerator.GenerateDateTime(mediaData.datetime)}</span>
                        </span>
                        </> : 
                        <>
                        <div className={styles.mediaViewerHeadProfile} style={{ backgroundImage: `url(${mediaData.userData.profileImage.url})` }} onClick={() => page.router.push(`/user/${mediaData.accountID}`)}></div>
                        <span className={styles.mediaViewerHeadData} onClick={() => page.router.push(`/user/${mediaData.accountID}`)}>
                            <span className={styles.mediaViewerHeadDataUser}>{`${mediaData.userData.firstName} ${mediaData.userData.lastName}`}</span>
                            <span className={styles.mediaViewerHeadDataDateTime}>{DateGenerator.GenerateDateTime(mediaData.datetime)}</span>
                        </span>
                        </>
                    }
                    <div className={styles.mediaViewerHeadOptionIcon}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        <div className={styles.mediaViewerHeadOptionBox}>
                            { mediaData.accountID === page.activeUser.accountID ? <span className={styles.mediaViewerHeadOption}>Edit Post</span> : null}
                            { mediaData.accountID === page.activeUser.accountID ? <span className={styles.mediaViewerHeadOption} onClick={() => handleDeleteEcho()}>Delete Post</span> : null }
                            <span className={styles.mediaViewerHeadOption}>Save</span>
                            <span className={styles.mediaViewerHeadOption}>Hide</span>
                            <span className={styles.mediaViewerHeadOption}>Report</span>
                        </div>
                    </div>
                </div>
                <div className={styles.mediaContent}>
                    { 
                        mediaData.content.media && mediaData.content.media.length > 0 ?
                        <div className={styles.media}>
                            { Helpers.getFileType(getCurrentMedia()) === "image" ? <img className={styles.mediaImage} src={getCurrentMedia()} alt="media" /> : null }
                            { Helpers.getFileType(getCurrentMedia()) === "video" ? <video className={styles.mediaVideo} controls src={getCurrentMedia()} autoPlay /> : null }
                            { Helpers.getFileType(getCurrentMedia()) === "unknown" ? <div className={styles.mediaUnknown}><span>Unknown File Type</span></div> : null }
                            
                            {
                                mediaData.content.media.length > 1 ?
                                <>
                                    <div className={styles.mediaControlRight} onClick={() => setMediaIndex(Math.min(mediaIndex + 1, mediaData.content.media.length - 1))}><SVGServer.ArrowRight color="var(--secondary)" width="25px" height="25px" /></div>
                                    <div className={styles.mediaControlLeft} onClick={() => setMediaIndex(Math.max(mediaIndex - 1, 0))}><SVGServer.ArrowRight color="var(--secondary)" width="25px" height="25px" /></div>

                                    <div className={styles.mediaCount}>
                                        {
                                            mediaData.content.media.map((media, index) =>
                                                <span key={index} style={{backgroundColor: index === mediaIndex ? "var(--accent)" : "var(--surface)"}}></span>
                                            )
                                        }
                                    </div>
                                </>
                                : null
                            }
                        </div> : null
                    }
                </div></> : null
            }
        </div>
        </>
    )
}