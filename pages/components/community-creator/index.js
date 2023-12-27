'use client';
import React, { useState, useEffect } from "react";
import styles from "./community-creator.module.css"

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import { Form } from "../../components/form";

export default function CommunityCreator({toggle, control, page}) {
    const [communityPrivacy, setCommunityPrivacy] = useState("public")
    const [communityName, setCommunityName] = useState("")
    const [nodeList, setNodeList] = useState([])
    const [communityNodes, setCommunityNodes] = useState([])
    const [communityDesc, setCommunityDesc] = useState("")
    const [createCommunityLoader, setCreateCommunityLoader] = useState(false)

    useEffect(() => {
        setNodeList(page.activeUser.nodes)
    }, [])

    const end = () => {
        setCommunityPrivacy("public")
        setCommunityName("")
        setCommunityDesc("")
        setCommunityNodes([])
        control(false)
    }

    const createCommunity = async () => {
        setCreateCommunityLoader(true)
        const createdCommunity = (data) => {
            if (data.success) {
                end()
                page.router.push(`/communities/${data.data.communityID}`)
            }
            page.createAlert(data.success ? "success" : "error", data.message)
            setCreateCommunityLoader(false)
        }
        APIClient.post(APIClient.routes.createCommunity, {
            accountID: page.activeUser.accountID,
            name: communityName,
            description: communityDesc,
            privacy: communityPrivacy,
            nodes: communityNodes
        }, createdCommunity)
    }

    const isValidData = () => {
        if (communityName.trim().length < 3) return false;
        if (communityNodes.length < 1) return false;
        if (communityDesc.trim().length < 10) return false;
        return true;
    }

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.communityCreatorContainer} style={{right: !toggle ? "-150vw" : null}}>
            <div className={styles.communityCreatorContainerHead}>
                <span className={styles.communityCreatorContainerTitle}>Create a <span className="titleGradient">Community</span></span>
                <span className={styles.communityCreatorContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>

            <Form.TextInput
                label="Name" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={communityName} 
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="A unique name for your community." 
                isValid={(value) => value.trim().length > 3}
                error="Community name must be more than 3 letters."
            />

            <Form.SelectMultipleInput
                label="Nodes" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                onAdd={(option) => setCommunityNodes(communityNodes.concat(option))}
                onRemove={(option) => setCommunityNodes(communityNodes.filter((node) => node.nodeID !== option.nodeID))}
                options={nodeList.map((node) => ({label: `${node.emoji} ${node.displayName}`, value: node}))}
            /> 

            <Form.AreaInput
                label="Description" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={communityDesc} 
                onChange={(e) => setCommunityDesc(e.target.value)}
                placeholder="What's your community about?"
                isValid={(value) => value.trim().length > 10}
                error="Community description must be more than 10 letters."
            />
            
            <Form.SelectSingleInput
                label="Privacy" 
                style={{width: "100%", marginBottom: "20px", backgroundColor: "var(--surface)"}}
                value={communityPrivacy}
                setValue={setCommunityPrivacy}
                options={[
                    {label: "Public", value: "public"},
                    {label: "Private", value: "private"}
                ]}
            />

            <Form.Submit text="CREATE" onClick={() => createCommunity()} loader={createCommunityLoader} disabled={!isValidData()} />
        </div>
        </>
    )
}