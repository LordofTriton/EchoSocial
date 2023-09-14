import React, { useState } from "react";
import styles from "./echo.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";

export default function Echo({ data, page, fullText=false, saved=false }) {
    const [echoData, setEchoData] = useState(data)
    const [echoMediaIndex, setEchoMediaIndex] = useState(0)
    const [deleted, setDeleted] = useState(false)
    const [echoSaved, setEchoSaved] = useState(saved)

    const getCurrentMedia = () => {
        return echoData.content.media[echoMediaIndex].url;
    }

    const handleHeartClick = async () => {
        if (!page.socket) return;
        if (echoData.userHearted) setEchoData({...echoData, userHearted: false, hearts: echoData.hearts - 1})
        else setEchoData({...echoData, userHearted: true, hearts: echoData.hearts + 1})

        page.socketMethods.socketEmitter(echoData.userHearted ? "DELETE_HEART" : "CREATE_HEART", { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        })
    }

    const handleDeleteEcho = async () => {
        if (echoData.content.media && echoData.content.media.length) {
            for (let file of echoData.content.media) {
                await APIClient.del(`/cloud/delete?publicID=${file.publicID}`);
            }
        }

        if (page.socket) page.socketMethods.socketEmitter("DELETE_ECHO", { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        })
        page.createAlert("success", "Echo deleted successfully.")
        setDeleted(true)
    }

    const handleSaveEcho = async () => {
        const createdSave = (data) => page.createAlert(data.success ? "success" : "error", data.message);
        if (page.socket) page.socketMethods.socketRequest("CREATE_SAVE", { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        }, createdSave)
        setEchoSaved(true)
    }

    const handleUnsaveEcho = async () => {
        if (page.socket) page.socketMethods.socketEmitter("DELETE_SAVE", { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        })
        page.createAlert("success", "Echo unsaved successfully.")
        setEchoSaved(false)
    }

    return (
        <div className={styles.echo} key={echoData.echoID} style={{display: deleted || (saved && !echoSaved) ? "none" : null}}>
            <div className={styles.echoHead}>
                {
                    echoData.communityID && !page.community ?
                    <>
                    <div className={styles.echoHeadProfile} style={{ backgroundImage: `url(${echoData.communityData.profileImage.url})` }} onClick={() => page.router.push(`/communities/${echoData.communityID}`)}></div>
                    <span className={styles.echoHeadData}>
                        <span className={styles.echoHeadDataUser} onClick={() => page.router.push(`/communities/${echoData.communityID}`)}>{`${echoData.communityData.name}`}</span>
                        <span className={styles.echoHeadDataDateTime}>
                            <span onClick={() => page.router.push(`/user/${echoData.accountID}`)}>
                                {`${echoData.userData.firstName} ${echoData.userData.lastName}`}
                                <span></span>
                            </span>
                            {DateGenerator.GenerateDateTime(echoData.datetime)}
                        </span>
                    </span>
                    </> : 
                    <>
                    <div className={styles.echoHeadProfile} style={{ backgroundImage: `url(${echoData.userData.profileImage.url})` }} onClick={() => page.router.push(`/user/${echoData.accountID}`)}></div>
                    <span className={styles.echoHeadData} onClick={() => page.router.push(`/user/${echoData.accountID}`)}>
                        <span className={styles.echoHeadDataUser}>{`${echoData.userData.firstName} ${echoData.userData.lastName}`}{ echoData.communityData ? <span>{ echoData.communityData.userRole || "EX MEMBER" }</span> : null }</span>
                        <span className={styles.echoHeadDataDateTime}>{DateGenerator.GenerateDateTime(echoData.datetime)}</span>
                    </span>
                    </>
                }
                <div className={styles.echoHeadOptionIcon}>
                    <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                    <div className={styles.echoHeadOptionBox}>
                        { echoData.accountID === page.activeUser.accountID ? <span className={styles.echoHeadOption} onClick={() => page.setShowEchoCreator(echoData)}>Edit Post</span> : null}
                        { echoData.accountID === page.activeUser.accountID ? <span className={styles.echoHeadOption} onClick={() => handleDeleteEcho()}>Delete Post</span> : null }
                        { echoData.accountID !== page.activeUser.accountID ? <span className={styles.echoHeadOption} onClick={() => echoSaved ? handleUnsaveEcho() : handleSaveEcho()}>{echoSaved ? "Unsave" : "Save"}</span> : null }
                        { echoData.accountID !== page.activeUser.accountID ? <span className={styles.echoHeadOption}>Report</span> : null }
                    </div>
                </div>
            </div>
            <div className={styles.echoContent}>
                { echoData.content.text ? <pre className={styles.echoText}>{Helpers.textLimiter(echoData.content.text, 180, fullText)} { echoData.content.text.length > 180 && !fullText ? <span className="titleGradient" onClick={() => page.setShowEchoViewer(echoData)}>See more</span> : null }</pre> : null}
                { 
                    echoData.content.media && echoData.content.media.length > 0 ?
                    <div className={styles.echoMedia} onClick={() => page.setShowMediaViewer(echoData)}>
                        { Helpers.getFileType(getCurrentMedia()) === "image" ? <img className={styles.echoMediaImage} src={getCurrentMedia()} alt="media" /> : null }
                        { Helpers.getFileType(getCurrentMedia()) === "video" ? <video className={styles.echoMediaVideo} src={getCurrentMedia()} /> : null }
                        { Helpers.getFileType(getCurrentMedia()) === "unknown" ? <div className={styles.echoMediaUnknown}><span>Unknown File Type</span></div> : null }
                        
                        {
                            echoData.content.media.length > 1 ?
                            <>
                                <div className={styles.echoMediaControlRight} onClick={() => setEchoMediaIndex(Math.min(echoMediaIndex + 1, echoData.content.media.length - 1))}><SVGServer.ArrowRight color="var(--secondary)" width="25px" height="25px" /></div>
                                <div className={styles.echoMediaControlLeft} onClick={() => setEchoMediaIndex(Math.max(echoMediaIndex - 1, 0))}><SVGServer.ArrowRight color="var(--secondary)" width="25px" height="25px" /></div>

                                <div className={styles.echoMediaCount}>
                                    {
                                        echoData.content.media.map((media, index) =>
                                            <span key={index} style={{backgroundColor: index === echoMediaIndex ? "var(--accent)" : "var(--surface)"}}></span>
                                        )
                                    }
                                </div>
                            </>
                            : null
                        }
                    </div> : null
                }
            </div>
            <div className={styles.echoFooter}>
                <div className={styles.echoFooterData} style={{float: "left"}}>
                    <span className={styles.echoFooterIcon} onClick={() => handleHeartClick()}>
                    {
                        echoData.userHearted ?
                        <SVGServer.HeartFilledIcon color="var(--primary)" width="25px" height="25px" />
                        : <SVGServer.HeartLineIcon color="var(--primary)" width="25px" height="25px" />
                    }
                    </span>
                    <span  className={styles.echoFooterNumber}>{echoData.hearts}</span>
                </div>
                <div className={styles.echoFooterData} style={{float: "right", marginRight: "0px"}}>
                    <span className={styles.echoFooterIcon}><SVGServer.ShareIcon color="var(--primary)" width="25px" height="25px" /></span>
                    <span  className={styles.echoFooterNumber}>{echoData.shares}</span>
                </div>
                <div className={styles.echoFooterData} style={{float: "right"}} onClick={() => page.setShowEchoViewer(echoData)}>
                    <span className={styles.echoFooterIcon}><SVGServer.CommentIcon color="var(--primary)" width="25px" height="25px" /></span>
                    <span  className={styles.echoFooterNumber}>{echoData.comments}</span>
                </div>
            </div>
        </div>
    )
}