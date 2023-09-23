import React, { useEffect, useState } from "react";
import styles from "./echo-conversation.module.css"

import DateGenerator from "../../../services/generators/DateGenerator";
import SVGServer from "../../../services/svg/svgServer";
import EchoComment from "../echo-comment";
import APIClient from "../../../services/APIClient";
import { Form } from "../form";
import Helpers from "../../../util/Helpers";

export default function EchoConversation({ data, control, page }) {
    const [echoData, setEchoData] = useState(data)
    const [echoComments, setEchoComments] = useState([])
    const [showCommentEditor, setShowCommentEditor] = useState(false)
    const [newCommentText, setNewCommentText] = useState(null)
    const [newCommentMedia, setNewCommentMedia] = useState(null)
    const [newCommentReply, setNewCommentReply] = useState(null)
    const [commentPage, setCommentPage] = useState(1)
    const [commentLoader, setCommentLoader] = useState(true)
    const [commentEditorLoader, setCommentEditorLoader] = useState(false)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })

    useEffect(() => {
        if (page.socket) {
            const updateComments = (data) => setEchoComments((state) => state.concat(data))
            if (data) page.socketMethods.socketListener(`NEW_COMMENT_${data.echoID}`, updateComments)
            else page.socketMethods.socketDeafener(`NEW_COMMENT_${data.echoID}`)
        }
        setEchoData(data)
        if (data) setCommentLoader(true)
    }, [data, page.socket])

    useEffect(() => {
        if (!data) {
            setEchoComments([])
            setShowCommentEditor(false)
            setNewCommentText("")
            setNewCommentMedia(null)
            setNewCommentReply(null)
            setCommentPage(1)
        }
        else {
            const updateComments = (data) => {
                if (data.success) {
                    setEchoComments((state) => [...data.data, ...state])
                    setPagination(data.pagination)
                }
                setCommentLoader(false)
            }
            if (page.socket) page.socketMethods.socketRequest("GET_COMMENTS", { 
                accountID: page.activeUser.accountID,
                echoID: data.echoID,
                page: commentPage,
                pageSize: 10
            }, updateComments)
        }
    }, [data, commentPage, page.socket])

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setNewCommentMedia(file);
    };

    const createComment = async () => {
        setCommentEditorLoader(true)
        let uploadedFile;
        if (newCommentMedia) {
            const formData = new FormData();
            formData.append(`media`, newCommentMedia)
            uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
            if (!uploadedFile.success) {
                createAlert({type: "error", message: uploadedFile.message})
                return;
            }
        }

        const updateComments = (data) => {
            page.createAlert(data.success ? "success" : "error", data.message)
            if (data.success) {
                setEchoComments(echoComments.concat(data.data))
            }
            setShowCommentEditor(false)
            setCommentEditorLoader(false)
        }
        if (page.socket) page.socketMethods.socketRequest("CREATE_COMMENT", { 
            echoID: echoData.echoID,
            accountID: page.activeUser.accountID,
            content: {
                text: newCommentText ? newCommentText : null,
                media: uploadedFile ? uploadedFile.data[0].url : null,
                link: null
            },
            datetime: Date.now(),
            repliedTo: newCommentReply ? newCommentReply : null
        }, updateComments)
    }

    const loadMore = () => {
        if (commentPage < pagination.totalPages && !commentLoader) {
            setCommentPage(commentPage + 1);
            setCommentLoader(true)
          }
    }

    return (
        <>
            <div className="modalOverlay" style={{ display: echoData ? "block" : "none" }} onClick={() => control(false)}></div>
            <div className={styles.echoViewerCommentsContainer} style={{ right: !echoData ? "-700px" : null }}>
                <div className={`${styles.echoViewerContainerHead} ${styles.echoViewerEchoHead}`}>
                    <span className={styles.echoViewerContainerHeadTitle}><span className="titleGradient">Conversation</span></span>
                    <span className={styles.echoViewerContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
                </div>
                <div className={styles.echoViewerCommentsContainerBody}>
                    { commentLoader ? 
                        <div className="loader" style={{
                            width: "30px",
                            height: "30px",
                            borderWidth: "3px",
                            borderColor: "var(--primary) transparent",
                            margin: "50px calc(50% - 15px) 50px calc(50% - 15px)"
                        }}></div>  : null
                    }
                    { commentPage < pagination.totalPages && echoComments.length ? <span onClick={() => loadMore()} className={styles.echoViewerCommentsContainerBodyLoad}>Load Previous Messages</span> : null }
                    {
                        echoComments && echoComments.length > 0 ?
                            echoComments.map((comment, index) =>
                                <EchoComment data={comment} page={{ ...page, setNewCommentReply, setShowCommentEditor }} key={index} />
                            ) : <span className={styles.echoViewerCommentsContainerBodyNull}>{!commentLoader && echoComments.length < 1 ? "No one commented yet. Be the first to speak!" : null}</span>
                    }
                </div>
                
                <div className={styles.echoViewerCommentEditor}>
                    <div className={styles.echoViewerCommentEditorHead} onClick={() => setShowCommentEditor(!showCommentEditor)}>
                        <span className={styles.echoViewerCommentEditorTitle}>Add Comment</span>
                    </div>
                    <div className={styles.echoViewerCommentEditorBody} style={{ display: showCommentEditor ? "block" : "none" }}>
                        {
                            newCommentReply ?
                                <div className={styles.echoViewerCommentEditorReplyBox}>
                                    <div className={styles.echoViewerCommentEditorReply}>
                                        {newCommentReply.content.media ? <div className={styles.echoViewerCommentEditorReplyMedia} style={{ backgroundImage: `url(${newCommentReply.content.media})` }}></div> : null}
                                        <div className={styles.echoViewerCommentEditorReplyBody}>
                                            <span className={styles.echoViewerCommentEditorReplyBodyHead}>{newCommentReply.name}<span>{DateGenerator.GenerateDateTime(newCommentReply.datetime)}</span></span>
                                            <div className={styles.echoViewerCommentEditorReplyBodyContent}>{newCommentReply.content.text ? <pre className={styles.echoCommentReplyBodyContentText}>{Helpers.textLimiter(newCommentReply.content.text, 50)} {newCommentReply.content.text.length > 180 ? <span>See more</span> : null}</pre> : null}</div>
                                        </div>
                                    </div>
                                    <div className={styles.echoViewerCommentEditorReplyClose} onClick={() => setNewCommentReply(null)}>
                                        <SVGServer.CloseIcon color="var(--surface)" width="30px" height="30px" />
                                    </div>
                                </div> : null
                        }
                        <textarea className={styles.echoViewerCommentEditorInput} placeholder="Type words..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}></textarea>
                        {
                            newCommentMedia ?
                                <div className={styles.echoViewerCommentEditorFileThumb}>
                                    <img src={URL.createObjectURL(newCommentMedia)} alt="thumb" />
                                    <span className={styles.echoViewerCommentEditorFileThumbClose} onClick={() => setNewCommentMedia(null)}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                                </div> :
                                <>
                                    <label htmlFor="fileSelector" className={styles.echoViewerCommentEditorFileSelect}><SVGServer.ImageIcon color="var(--secondary)" width="30px" height="30px" /></label>
                                    <input type="file" id="fileSelector" className={styles.fileInput} accept="image/*" onChange={(e) => handleFileSelect(e)} multiple />
                                </>
                        }
                        <Form.Submit text="POST" onClick={() => createComment()} loader={commentEditorLoader} />
                    </div>
                </div>
            </div>
        </>
    )
}