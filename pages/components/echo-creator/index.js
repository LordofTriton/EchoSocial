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
    const [echoLink, setEchoLink] = useState("")
    const [nodeList, setNodeList] = useState([])
    const [echoNodes, setEchoNodes] = useState([])
    const [echoText, setEchoText] = useState("")
    const [linkSelector, setLinkSelector] = useState(false)
    const [communityData, setCommunityData] = useState(page.community)
    const [createEchoLoader, setCreateEchoLoader] = useState(false)

    useEffect(() => {
        const nodes = page.community ? page.community.communityNodes : page.activeUser.nodes;
        setNodeList(nodes)
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

    const handleFileRemove = (id) => {
        const updatedFiles = echoMedia.filter((media, index) => index !== id)
        setEchoMedia(updatedFiles)
    }

    const end = () => {
        setEchoNodes([])
        setEchoMedia([])
        setEchoText("")
        control(false)
    }

    const createEcho = async () => {
        setCreateEchoLoader(true)
        const formData = new FormData();
        echoMedia.forEach((file) => { formData.append(`media`, file) });
        const uploadedFiles = (await APIClient.post("/cloud/upload", formData, {'Content-Type': "multipart/form-data"})).data;
        if (!uploadedFiles.success) {
            createAlert({type: "error", message: uploadedFiles.message})
            return;
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
            nodes: echoNodes.map((node) => node.nodeID),
            content: {
                text: echoText ? echoText : null,
                media: uploadedFiles.data ? uploadedFiles.data.map((media) => { return { ...media, type: Helpers.getFileType(media.url) }}) : null,
                link: echoLink ? echoLink : null
            }
        }, createdEcho)
    }

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.echoCreatorContainer} style={{right: toggle ? "70px" : "-500px"}}>
            <div className={styles.echoCreatorContainerHead}>
                <span className={styles.echoCreatorContainerTitle}>Create an Echo</span>
                <span className={styles.echoCreatorContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>

            <Form.SelectSingleInput
                label="Audience" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={echoAudience}
                setValue={setEchoAudience}
                options={
                    communityData ? [{label: communityData.communityName, value: "community"}] : [ {label: "Public", value: "public"}, {label: "Friends", value: "friends"}, {label: "Private", value: "private"} ]
                }
            />

            <Form.SelectMultipleInput
                label="Nodes" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                onAdd={(option) => setEchoNodes(echoNodes.concat(option))}
                onRemove={(option) => setEchoNodes(echoNodes.filter((node) => node.nodeID !== option.nodeID))}
                options={nodeList.map((node) => ({label: `${node.emoji} ${node.displayName}`, value: node}))}
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
                echoMedia && echoMedia.length > 0 ?
                <div className={styles.echoCreatorFileDisplay}>
                {
                    echoMedia.map((media, index) => 
                        <div key={index} className={styles.echoCreatorFileThumb}>
                            { media.type.startsWith('image/') ? <img src={URL.createObjectURL(media)} alt="media" /> : null }
                            { media.type.startsWith('video/') ? <video src={URL.createObjectURL(media)} controls /> : null }

                            <span className={styles.echoCreatorFileThumbClose} onClick={() => handleFileRemove(index)}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
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
            <Form.Submit text="POST" onClick={() => createEcho()} loader={createEchoLoader} />
        </div>
        </>
    )
}