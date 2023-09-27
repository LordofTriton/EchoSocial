'use client';
import React, { useState, useEffect } from "react";
import styles from "./echo-creator.module.css"

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import { Form } from "../../components/form";
import Helpers from "../../../util/Helpers";

export default function EchoCreator({toggle, control, page}) {
    const [echoAudience, setEchoAudience] = useState("public")
    const [echoMedia, setEchoMedia] = useState([])
    const [oldEchoMedia, setOldEchoMedia] = useState([])
    const [echoLink, setEchoLink] = useState("")
    const [nodeList, setNodeList] = useState([])
    const [echoNodes, setEchoNodes] = useState([])
    const [echoText, setEchoText] = useState("")
    const [linkSelector, setLinkSelector] = useState(false)
    const [communityData, setCommunityData] = useState(page.community)
    const [createEchoLoader, setCreateEchoLoader] = useState(false)
    
    useEffect(() => {
        if (toggle.echoID) {
            setEchoAudience(toggle.audience)
            setOldEchoMedia(toggle.content.media ? toggle.content.media : [])
            setEchoLink(toggle.content.link)
            setEchoNodes(toggle.nodes)
            setEchoText(toggle.content.text)
        }
    }, [toggle])

    useEffect(() => {
        if (toggle.echoID) setNodeList(toggle.communityID ? [toggle.communityData.node] : page.activeUser.nodes)
        else setNodeList(page.community ? [page.community.communityNode] : page.activeUser.nodes)
    }, [page])

    useEffect(() => {
        setCommunityData(page.community)
        if (page.community) {
            setEchoAudience(page.community.communityName)
        }
    }, [page])

    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (!files) return;
        const fileList = Array.from(files);
    
        setEchoMedia(echoMedia.concat(fileList));
    };

    const handleNewFileRemove = (id) => {
        const updatedFiles = echoMedia.filter((media, index) => index !== id)
        setEchoMedia(updatedFiles)
    }

    const handleOldFileRemove = (id) => {
        const updatedFiles = oldEchoMedia.filter((media, index) => index !== id)
        setOldEchoMedia(updatedFiles)
    }

    const end = () => {
        setEchoNodes([])
        setEchoMedia([])
        setEchoText("")
        control(false)
    }

    const editEcho = async () => {
        setCreateEchoLoader(true)
        let media = oldEchoMedia;
        const originalMedia = toggle.content.media ? toggle.content.media : []
        const removedMedia = originalMedia.filter((media) => !oldEchoMedia.map((oldMedia) => oldMedia.url).includes(media.url))
        for (let file of removedMedia) {
            await APIClient.del(`/cloud/delete?publicID=${file.publicID}`);
        }

        if (echoMedia.length > 0) {
            const formData = new FormData();
            echoMedia.forEach((file) => { formData.append(`media`, file) });
            const uploadedFiles = (await APIClient.post("/cloud/upload", formData, {'Content-Type': "multipart/form-data"})).data;
            if (!uploadedFiles.success) {
                page.createAlert({type: "error", message: uploadedFiles.message})
                return;
            }
            media = media.concat(uploadedFiles.data.map((file) => { return { ...file, type: Helpers.getFileType(file.url) }}))
        }

        if (page.socket) {
            page.socketMethods.socketEmitter("UPDATE_ECHO", {
                accountID: page.activeUser.accountID,
                echoID: toggle.echoID,
                audience: echoAudience,
                nodes: echoNodes,
                content: {
                    text: echoText ? echoText : null,
                    media: media.length > 0 ? media : null,
                    link: echoLink ? echoLink : null
                }
            })
            page.createAlert("success", "Updated echo successfully.")
            setCreateEchoLoader(false)
            end()
        }
    }

    const createEcho = async () => {
        setCreateEchoLoader(true)
        let media = [];
        if (echoMedia.length > 0) {
            const formData = new FormData();
            echoMedia.forEach((file) => { formData.append(`media`, file) });
            const uploadedFiles = (await APIClient.post("/cloud/upload", formData, {'Content-Type': "multipart/form-data"})).data;
            if (!uploadedFiles.success) {
                page.createAlert({type: "error", message: uploadedFiles.message})
                return;
            }
            media = media.concat(uploadedFiles.data.map((file) => { return { ...file, type: Helpers.getFileType(file.url) }}))
        }

        const createdEcho = (data) => {
            if (data.success) end()
            page.createAlert(data.success ? "success" : "error", data.message)
            setCreateEchoLoader(false)
        }
        if (page.socket) page.socketMethods.socketRequest("CREATE_ECHO", {
            accountID: page.activeUser.accountID,
            communityID: communityData ? communityData.communityID : null,
            audience: echoAudience,
            nodes: echoNodes,
            content: {
                text: echoText ? echoText : null,
                media: media.length > 0 ? media : null,
                link: echoLink ? echoLink : null
            }
        }, createdEcho)
    }

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.echoCreatorContainer} style={{right: !toggle ? "-700px" : null}}>
            <div className={styles.echoCreatorContainerHead}>
                <span className={styles.echoCreatorContainerTitle}>{toggle.echoID ? "Edit" : "Create an"} <span className="titleGradient">Echo</span></span>
                <span className={styles.echoCreatorContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>

            <Form.SelectSingleInput
                label="Audience" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={echoAudience}
                setValue={setEchoAudience}
                options={
                    communityData ? [{label: communityData.communityName, value: communityData.communityNode}] : [ {label: "Public", value: "public"}, {label: "Friends", value: "friends"}, {label: "Private", value: "private"} ]
                }
            />

            <Form.SelectMultipleInput
                label="Nodes" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                defaultValue={echoNodes}
                onAdd={(option) => setEchoNodes(echoNodes.concat(option))}
                onRemove={(option) => setEchoNodes(echoNodes.filter((node) => node !== option))}
                options={nodeList.map((node) => ({label: `${node.emoji} ${node.displayName}`, value: node.nodeID}))}
            /> 

            <Form.AreaInput
                label="Content" 
                style={{width: "100%", float: "left", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={echoText} 
                onChange={(e) => setEchoText(e.target.value)}
                placeholder={`What's on your mind, ${page.activeUser.firstName}?`}
            />
            {/* <textarea className={styles.echoCreatorText} placeholder={`What's on your mind, ${page.activeUser.firstName}?`} value={echoText} onChange={(e) => setEchoText(e.target.value)}></textarea> */}
            
            {
                (echoMedia && echoMedia.length > 0) || (oldEchoMedia && oldEchoMedia.length > 0) ?
                <div className={styles.echoCreatorFileDisplay}>
                {
                    oldEchoMedia.map((media, index) => 
                        <div key={index} className={styles.echoCreatorFileThumb}>
                            { media.type === "image" ? <img src={media.url} alt="media" /> : null }
                            { media.type === "video" ? <video src={media.url} controls /> : null }

                            <span className={styles.echoCreatorFileThumbClose} onClick={() => handleOldFileRemove(index)}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                    )
                }
                {
                    echoMedia.map((media, index) => 
                        <div key={index} className={styles.echoCreatorFileThumb}>
                            { media.type.startsWith('image/') ? <img src={URL.createObjectURL(media)} alt="media" /> : null }
                            { media.type.startsWith('video/') ? <video src={URL.createObjectURL(media)} controls /> : null }

                            <span className={styles.echoCreatorFileThumbClose} onClick={() => handleNewFileRemove(index)}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                    )
                }
                </div> : null
            }

            { linkSelector ? <input type="text" className={styles.echoCreatorLinkSelector} placeholder="Link URL..." value={echoLink} onChange={(e) => setEchoLink(e.target.value)} /> : null }

            <div className={styles.echoCreatorMediaGallery}>
                <>
                    <label htmlFor="imagefileSelector"><SVGServer.ImageIcon color="var(--primary)" width="30px" height="30px" /></label>
                    <input type="file" id="imagefileSelector" className={styles.echoCreatorFile} accept="image/*" onChange={(e) => handleFileSelect(e)} multiple/>
                </>
                <>
                    <label htmlFor="videofileSelector"><SVGServer.VideoIcon color="var(--primary)" width="30px" height="30px" /></label>
                    <input type="file" id="videofileSelector" className={styles.echoCreatorFile} accept="video/mp4" onChange={(e) => handleFileSelect(e)} multiple/>
                </>
                <span onClick={() => setLinkSelector(true)}><SVGServer.LinkIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>
            <Form.Submit text="POST" onClick={() => toggle.echoID ? editEcho() : createEcho()} loader={createEchoLoader} />
        </div>
        </>
    )
}