'use client';
import React, { useState, useEffect } from "react";
import styles from "./node-creator.module.css"

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import Form from "../../components/form";

export default function NodeCreator({toggle, control, page}) {
    const [newNode, setNewNode] = useState({
        emoji: "",
        name: ""
    })
    const [createNodeLoader, setCreateNodeLoader] = useState(false)

    const end = () => {
        setNewNode({
            emoji: "",
            name: ""
        })
        control(false)
    }

    const createNode = async () => {
        setCreateNodeLoader(true)
        const createdNode = (data) => {
            if (data.success) end();
            page.createAlert(data.success ? "success" : "error", data.message)
            setCreateNodeLoader(false)
        }
        if (page.socket) page.socketMethods.socketRequest("CREATE_NODE", { 
            accountID: page.activeUser.accountID,
            ...newNode
        }, createdNode)
    }

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.nodeCreatorContainer} style={{right: toggle ? "70px" : "-500px"}}>
            <div className={styles.nodeCreatorContainerHead}>
                <span className={styles.nodeCreatorContainerTitle}>Create a Node</span>
                <span className={styles.nodeCreatorContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>

            <Form.TextInput 
                label="Emoji (Optional)" 
                style={{width: "100%", float: "left", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={newNode.emoji} 
                onChange={(e) => setNewNode({...newNode, emoji: e.target.value })} 
            />

            <Form.TextInput 
                label="Name" 
                style={{width: "100%", float: "left", marginBottom: "20px", backgroundColor: "var(--surface)"}} 
                value={newNode.name} 
                onChange={(e) => setNewNode({...newNode, name: e.target.value })} 
            />
            <Form.Submit text="POST" onClick={() => createNode()} loader={createNodeLoader} />
        </div>
        </>
    )
}