import React, { useEffect, useState } from "react";
import styles from "./echo-comment.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";

export default function EchoComment({ data, page }) {
    const [commentData, setCommentData] = useState(data)
    const [commentPage, setCommentPage] = useState(1)
    const [showReplier, setShowReplier] = useState(false)
    const [fullText, setFullText] = useState(false)

    useEffect(() => {
        setCommentData(data)
    }, [data])

    const handleHeartClick = async () => {
        if (!page.socket) return;
        if (commentData.userHearted) setCommentData({...commentData, userHearted: false, hearts: commentData.hearts - 1})
        else setCommentData({...commentData, userHearted: true, hearts: commentData.hearts + 1})

        page.socketMethods.socketEmitter(commentData.userHearted ? "DELETE_HEART" : "CREATE_HEART", { 
            accountID: page.activeUser.accountID,
            commentID: commentData.commentID
        })
    }

    const handleDeleteComment = async () => {
        if (commentData.content.media) {
            const file = commentData.content.media;
            await APIClient.del(`/cloud/delete?publicID=${file.publicID}`)
        }

        if (page.socket) page.socketMethods.socketEmitter("DELETE_COMMENT", { 
            accountID: page.activeUser.accountID,
            commentID: commentData.commentID
        })
    }

    return (
        <div className={styles.echoComment}>
            <div className={styles.echoCommentProfile} style={{backgroundImage: `url(${commentData.profileImage.url}`}} onClick={() => page.router.push(`/user/${commentData.accountID}`)}></div>
            <div className={styles.echoCommentBody}>
                <div className={styles.echoCommentData}>
                    <span className={styles.echoCommentBodyHead} onClick={() => page.router.push(`/user/${commentData.accountID}`)}>{commentData.firstName} {commentData.lastName}<span>{DateGenerator.GenerateDateTime(commentData.datetime)}</span></span>
                    <div className={styles.echoCommentBodyContent}>
                        {
                            commentData.repliedTo ?
                            <div className={styles.echoCommentBodyContentReply}>
                                { commentData.repliedTo.content.media ? <div className={styles.echoCommentBodyContentReplyMedia} style={{backgroundImage: `url(${commentData.repliedTo.content.media})`}}></div> : null }
                                <div className={styles.echoCommentBodyContentReplyBody}>
                                    <span className={styles.echoCommentBodyHead}>{commentData.repliedTo.name}<span>{DateGenerator.GenerateDateTime(commentData.repliedTo.datetime)}</span></span>
                                    <div className={styles.echoCommentBodyContentReplyBodyContent}>{ commentData.repliedTo.content.text ? <span className={styles.echoCommentReplyBodyContentText}>{Helpers.textLimiter(commentData.repliedTo.content.text, 50, fullText)}</span> : null}</div>
                                </div>
                            </div> : null
                        }
                        {
                            commentData.content.media ?
                            <div className={styles.echoCommentBodyContentMedia}>
                                { Helpers.getFileType(commentData.content.media) === "image" ? <img className={styles.echoCommentBodyContentMediaImage} src={commentData.content.media} /> : null }
                                { Helpers.getFileType(commentData.content.media) === "unknown" ? <div className={styles.echoCommentBodyContentMediaUnknown}><span>Unknown File Type</span></div> : null }
                            </div> : null
                        }
                        { commentData.content.text ? <pre className={styles.echoCommentBodyContentText}>{Helpers.textLimiter(commentData.content.text, 180, fullText)} { !fullText && commentData.content.text.length > 180 ? <span onClick={() => setFullText(true)}>See more</span> : null }</pre> : null}
                    </div>
                </div>
                <div className={styles.echoCommentButtons}>
                    <span className={styles.echoCommentButton} onClick={() => handleHeartClick()}>
                        <span>{commentData.hearts}</span>
                        {
                            commentData.userHearted ?
                            <SVGServer.HeartFilledIcon color="var(--surface)" width="20px" height="20px" />
                            : <SVGServer.HeartLineIcon color="var(--surface)" width="20px" height="20px" />
                        }
                    </span>
                    <span className={styles.echoCommentButton} onClick={() => {page.setNewCommentReply({ accountID: commentData.accountID, name: `${commentData.firstName} ${commentData.lastName}`, content: commentData.content, datetime: commentData.datetime }); page.setShowCommentEditor(true)}} style={{float: "left"}}>
                        <SVGServer.ReplyIcon color="var(--surface)" width="20px" height="20px" />
                    </span>
                </div>
            </div>
        </div>
    )
}