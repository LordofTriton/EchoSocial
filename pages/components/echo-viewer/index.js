import React, { useEffect, useState } from "react";
import styles from "./echo-viewer.module.css"

import DateGenerator from "../../../services/generators/DateGenerator";
import SVGServer from "../../../services/svg/svgServer";
import Echo from "../echo";
import EchoComment from "../echo-comment";
import APIClient from "../../../services/APIClient";
import { Form } from "../form";
import Helpers from "../../../util/Helpers";

export default function EchoViewer({ data, control, page }) {
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