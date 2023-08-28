import Head from 'next/head'
import React, { useState, useEffect } from "react";
import AppConfig from "../../util/config";
import { useRouter } from 'next/router';
import styles from './nodes.module.css';

import Link from 'next/link';

import Alert from "../components/alert";
import Cache from "../../services/CacheService";
import APIClient from "../../services/APIClient";
import { Form } from "../components/form";
import SVGServer from '../../services/svg/svgServer';
import { useSocketContext } from '../../util/SocketProvider';

export default function Nodes() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [selectedNodes, setSelectedNodes] = useState([])
    const [nodeLoader, setNodeLoader] = useState(false)
    const [submitLoader, setSubmitLoader] = useState(false)
    const [nodeList, setNodeList] = useState([])
    const [nodeFilter, setNodeFilter] = useState(null)
    const [alert, setAlert] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const {socket, socketMethods} = useSocketContext()

    useEffect(() => {
        updateNodeList()
    }, [searchQuery, socket])

    const updateNodeList = async () => {
        if (searchQuery.length % 2 === 0) {
            const query = String(searchQuery).toLowerCase().replace(/\s/g, "").trim()

            const getNodes = (data) => data.success ? setNodeList(data.data) : null;
            if (socket) socketMethods.socketRequest("GET_NODES", { 
                accountID: activeUser.accountID,
                filter: query,
                page: 1,
                pageSize: 10
            }, getNodes)
        }
    }

    const handleSubmit = async () => {
        setNodeLoader(true)

        if (socket) socketMethods.socketEmitter("UPDATE_ACCOUNT", { 
            accountID: activeUser.accountID,
            nodes: selectedNodes
        })
        Cache.saveData("EchoUser", {...activeUser, nodes: selectedNodes})

        router.push("/")
        
        setNodeLoader(false)
    }

    return(
        <div className={styles.nodePage}>
        <Head>
            <title>Echo - Nodes</title>
            <meta name="description" content="A simple social media." />
            <link rel="icon" href="/favicon.ico" />
            <link rel="stylesheet" href={`/styles/themes/${activeUser.dark ? 'classic-dark.css' : 'classic-light.css'}`} />
        </Head>
            <div className={styles.nodeHeader}>
                <img src={`${AppConfig.HOST}/images/logo.png`} alt="logo" className={styles.nodeHeaderLogo} />
                <span className={styles.nodeHeaderTitle}>echo</span>
            </div>
            <div className={styles.nodeContainer}>
                <div className={styles.nodeContainerNodeBox}>
                    <div className={styles.nodeContainerSearch}>
                        <Form.TextInput
                            label="Search Nodes" 
                            style={{width: "100%", float: "right", marginBottom: "20px"}} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search hobbies and interests."
                        />
                    </div>
                    <div className={styles.nodeContainerTrayBox}>
                        {
                            nodeList && nodeList.length > 0 ?
                            nodeList.map((node, index) => 
                                <span 
                                    key={index}
                                    className={styles.node} 
                                    style={{backgroundColor: selectedNodes.includes(node) ? "var(--primary)" : "var(--accent)"}} 
                                    onClick={() => selectedNodes.includes(node) ? setSelectedNodes(selectedNodes.filter((item) => item.name !== node.name)) : setSelectedNodes(selectedNodes.concat(node))}
                                >
                                    {node.emoji} {node.displayName}
                                </span>
                            ) : <span className={styles.nodeContainerNullNode}>Nothing to show. {searchQuery.length ? "Try a different search term." : null}</span>
                        }
                    </div>
                    <div className={styles.nodeContainerNodeList}>
                        <div style={{display: "inline-block"}}>
                        {
                            selectedNodes.length ?
                            selectedNodes.map((node, index) =>
                            <span key={index} className={styles.nodeContainerSelectedNode}>
                                {node.emoji} {node.displayName}
                                <span onClick={() => setSelectedNodes(selectedNodes.filter((item) => item.nodeID !== node.nodeID))}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                            </span>
                            ) : <span className={styles.nodeContainerNullNode}>Select at least three nodes...</span>
                        }
                        </div>
                    </div>
                </div>
                <div className={styles.nodeContainerFormBox}>
                    <div className={styles.nodeContainerHead}>
                        <h3 className={styles.nodeContainerTitle}>What are you into?</h3>
                        <span className={styles.nodeContainerTitleText}>Help us show you what you want to see.</span>
                    </div>
                    <div className={styles.nodeContainerBody}>
                        <button className={styles.nodeContainerBodyButton} style={{backgroundColor: selectedNodes.length < 3 ? "var(--alt)" : null}} onClick={() => handleSubmit()}>Continue</button>
                    </div>
                    
                </div>
            </div>

            {alert ? <Alert type={alert.type} message={alert.message} control={setAlert} /> : null }
        </div>
    )
}