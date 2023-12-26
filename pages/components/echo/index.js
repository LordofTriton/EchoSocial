import React, { useEffect, useState } from "react";
import styles from "./echo.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";

function VideoMedia({ source }) {
    const handleClick = () => {
      const el = document.getElementById(`VideoMedia_${source}`)
      if (el) el.pause()
    }
    useEffect(() => { setTimeout(() => handleClick(), 15000) }, [])
    
    return ( <video className={styles.echoMediaVideo} src={source} id={`VideoMedia_${source}`} onClick={() => handleClick()} autoPlay muted /> )
}

export default function Echo({ data, page, fullText=false, saved=false }) {
    const [echoData, setEchoData] = useState(data)
    const [echoMediaIndex, setEchoMediaIndex] = useState(0)
    const [deleted, setDeleted] = useState(false)
    const [echoSaved, setEchoSaved] = useState(data.userSaved)
    const [videoClicked, setVideoClicked] = useState(false)
    const [showNodes, setSHowNodes] = useState(false)

    useEffect(() => {
        setEchoData(data)
    }, [data])

    const getCurrentMedia = () => {
        return echoData.content.media[echoMediaIndex].url;
    }

    const handleHeartClick = async () => {
        if (echoData.userHearted) setEchoData({...echoData, userHearted: false, hearts: echoData.hearts - 1})
        else setEchoData({...echoData, userHearted: true, hearts: echoData.hearts + 1})

        if (echoData.userHearted) {
            APIClient.del(APIClient.routes.deleteHeart, { 
                accountID: page.activeUser.accountID,
                echoID: echoData.echoID
            })
        } else {
            APIClient.post(APIClient.routes.createHeart, { 
                accountID: page.activeUser.accountID,
                echoID: echoData.echoID
            })
        }
    }

    const handleDeleteEcho = async () => {
        if (echoData.content.media && echoData.content.media.length) {
            for (let file of echoData.content.media) {
                await APIClient.del(APIClient.routes.deleteFile, { publicID: file.publicID });
            }
        }

        APIClient.del(APIClient.routes.deleteEcho, { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        })
        page.createAlert("success", "Echo deleted successfully.")
        setDeleted(true)
    }

    const handleSaveEcho = async () => {
        if (echoData.accountID === page.activeUser.accountID) return;
        const createdSave = (data) => page.createAlert(data.success ? "success" : "error", data.success ? "Echo saved successfully." : data.message);
        APIClient.post(APIClient.routes.createSave, { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        }, createdSave)
        setEchoSaved(true)
    }

    const handleUnsaveEcho = async () => {
        if (echoData.accountID === page.activeUser.accountID) return;
        APIClient.del(APIClient.routes.deleteSave, { 
            accountID: page.activeUser.accountID,
            echoID: echoData.echoID
        })
        page.createAlert("success", "Echo unsaved successfully.")
        setEchoSaved(false)
    }

    const handleClickMedia = () => {
        page.setShowMediaViewer(echoData)
        if (Helpers.getFileType(getCurrentMedia()) === "video") setVideoClicked(true)
    }

    const getNodeData = () => {
        let nodes = [];
        nodes = echoData.communityID ? [echoData.communityData.node] : page.activeUser.nodes.filter((node) => echoData.nodes.includes(node.nodeID))
        return nodes;
    }

    return (
        <div className={styles.echoContainer}>
            {
                showNodes && getNodeData().length > 0 && (
                    <div className={styles.echoNodeList}>
                        <div style={{ display: "inline-block" }}>
                            {
                                getNodeData().map((node, index) =>
                                    <span key={index} className={styles.echoNode}>
                                        {node.emoji} {node.displayName}
                                    </span>
                                )
                            }
                        </div>
                    </div>
                )
            }
            <div id={echoData.echoID} className={styles.echo} style={{display: deleted || (saved && !echoSaved) ? "none" : null}}>
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
                            <span className={styles.echoHeadDataUser}>{`${echoData.userData.firstName} ${echoData.userData.lastName}`}{ echoData.communityData && page.community ? <span>{ echoData.communityData.userRole || "EX MEMBER" }</span> : null }</span>
                            <span className={styles.echoHeadDataDateTime}>
                                <span style={{textTransform: "capitalize", color: "var(--alt)"}}>
                                    {echoData.userData.nickname}
                                    <span></span>
                                </span>
                                {DateGenerator.GenerateDateTime(echoData.datetime)}
                            </span>
                        </span>
                        </>
                    }
                    <div className={styles.echoHeadOptionIcon}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        <div className={styles.echoHeadOptionBox}>
                            {
                                echoData.accountID === page.activeUser.accountID && echoData.nodes.length > 0 ?
                                <>
                                { echoData.communityID && !page.community ? null : <span className={styles.echoHeadOption} onClick={() => page.setShowEchoCreator(echoData)}>Edit Post</span> }
                                <span className={styles.echoHeadOption} onClick={() => handleDeleteEcho()}>Delete Post</span>
                                </> : null
                            }
                            <span className={styles.echoHeadOption} onClick={() => setSHowNodes(!showNodes)}>{showNodes ? "Hide" : "Show"} Nodes</span>
                        </div>
                    </div>
                </div>
                <div className={styles.echoContent}>
                    { echoData.content.text ? <pre className={styles.echoText} style={{marginBottom: echoData.content.media ? null : "0px"}}>{Helpers.textLimiter(echoData.content.text, 180, fullText)} { echoData.content.text.length > 180 && !fullText ? <span className="titleGradient" onClick={() => page.setShowEchoViewer(echoData)}>See more</span> : null }</pre> : null}
                    { 
                        echoData.content.media && echoData.content.media.length > 0 ?
                        <div className={styles.echoMedia} onClick={() => handleClickMedia()}>
                            { Helpers.getFileType(getCurrentMedia()) === "image" ? <img className={styles.echoMediaImage} src={getCurrentMedia()} alt="media" /> : null }
                            { Helpers.getFileType(getCurrentMedia()) === "video" ? 
                                <>
                                <VideoMedia source={getCurrentMedia()} />
                                <div className={styles.echoMediaVideoOverlay}>
                                    <span>
                                        <SVGServer.PlayIcon color="var(--primary)" width="50px" height="50px" />
                                    </span>
                                </div>
                                </> : null 
                            }
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
                    {
                        echoData.accountID !== page.activeUser.accountID ?
                        <div className={styles.echoFooterData} style={{float: "right", marginRight: "0px"}} onClick={() => echoSaved ? handleUnsaveEcho() : handleSaveEcho()}>
                            <span className={styles.echoFooterIcon}>
                            {
                                echoSaved || echoData.accountID === page.activeUser.accountID ?
                                <SVGServer.BookmarkIconFilled color="var(--primary)" width="25px" height="25px" />
                                : <SVGServer.BookmarkIconLine color="var(--primary)" width="25px" height="25px" />
                            }
                            </span>
                        </div> : null
                    }
                    <div className={styles.echoFooterData} style={{float: "right", marginRight: echoData.accountID === page.activeUser.accountID ? "0px" : null}} onClick={() => page.setShowEchoComments(echoData)}>
                        <span className={styles.echoFooterIcon}><SVGServer.CommentIcon color="var(--primary)" width="25px" height="25px" /></span>
                        <span  className={styles.echoFooterNumber}>{echoData.comments}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}