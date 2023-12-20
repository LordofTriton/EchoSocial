import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "./settings.module.css"
import { useRouter } from 'next/router'

import CacheService from '../../services/CacheService'
import Modals from '../components/modals';
import { Form } from "../components/form";
import APIClient from "../../services/APIClient";
import SVGServer from "../../services/svg/svgServer";
import useModalStates from '../hooks/useModalStates'
import { useSSEContext } from '../../util/SocketProvider'
import useDataStates from '../hooks/useDataStates'

export default function NodesSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userAccount, setUserAccount] = useState(activeUser)
    const [userNodes, setUserNodes] = useState(activeUser.nodes)
    const [nodeList, setNodeList] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(true)
    

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        updateNodeList()
    }, [searchQuery])

    const updateNodeList = async () => {
        if (searchQuery.length % 2 === 0) {
            const query = String(searchQuery).toLowerCase().replace(/\s/g, "").trim()
            const getNodes = (data) => data.success ? setNodeList(data.data) : null;
            APIClient.get(APIClient.routes.getNodes, {
                accountID: activeUser.accountID,
                filter: query,
                page: 1,
                pageSize: 10
            }, getNodes)
        }
    }

    const handleSubmit = async () => {
        APIClient.post(APIClient.routes.updateAccount, {
            accountID: activeUser.accountID,
            nodes: userNodes
        })
        createAlert("success", "Settings updated successfully.")
        CacheService.saveData("EchoActiveUser", {...activeUser, nodes: userNodes})
        updateNodeList()
    }

    const handleRevert = () => {
        setUserNodes(activeUser.nodes)
    }

    const pageControl = {
        title: "Settings",
        router,
        cookies: CacheService,
        cache: CacheService,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl,
    }

    return (
        <div className="page" style={{backgroundColor: "var(--base)"}}>
            <Head>
                <title>Echo - Settings</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.settingsHead}></div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingsBodyNav}>
                        <span className={styles.settingsBodyNavTitle}>Settings</span>

                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)" }} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                                <>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings")}>Profile Info</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} style={{ color: "var(--accent)"}} onClick={() => router.push("/settings/nodes")}>Nodes</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/change-password")}>Change/Reset Password</span>
                                </> : null
                        }
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/privacy")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.PrivacyIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Privacy</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/feed")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.FeedIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Feed</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/notifications")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.NotificationIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Notifications</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/messaging")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ChatIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Chat & Messaging</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/blacklist")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.BlockIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Blacklist</span>
                        </div>
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Nodes</span>
                            <div className={styles.formContainerForm}>
                                <div className={styles.formContainerFormNodeList}>
                                    <div style={{ display: "inline-block" }}>
                                        {
                                            userNodes.length ?
                                                userNodes.map((node, index) =>
                                                    <span key={index} className={styles.formContainerFormSelectedNode}>
                                                        {node.emoji} {node.displayName}
                                                        <span onClick={() => setUserNodes(userNodes.filter((item) => item.nodeID !== node.nodeID))}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                                                    </span>
                                                ) : null
                                        }
                                    </div>
                                </div>
                                <div className={styles.formContainerFormNodeSelector}>
                                    <Form.TextInput
                                        label="Search Nodes"
                                        style={{ width: "100%", float: "right", marginBottom: "20px" }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search hobbies and interests."
                                    />
                                    <div className={styles.formContainerFormNodeSelectorNodeBox}>
                                        <span className={styles.formContainerFormSelectorNodes}>
                                            {
                                                nodeList && nodeList.length > 0 ?
                                                    nodeList.map((node, index) =>
                                                        <span
                                                            key={index}
                                                            className={styles.formContainerFormSelectorNode}
                                                            style={{ backgroundColor: userNodes.find((item) => item.nodeID === node.nodeID) ? "var(--primary)" : "var(--accent)" }}
                                                            onClick={() => userNodes.find((item) => item.nodeID === node.nodeID) ? setUserNodes(userNodes.filter((item) => item.name !== node.name)) : setUserNodes(userNodes.concat(node))}
                                                        >
                                                            {node.emoji} {node.displayName}
                                                        </span>
                                                    ) : null
                                            }
                                            <span className={styles.formContainerFormSelectorNode} style={{ width: "40px", height: "40px", padding: "5px" }} onClick={() => modalControl.setShowNodeCreator(true)}><SVGServer.AddIcon color="var(--surface)" width="30px" height="30px" /></span>
                                        </span>
                                    </div>
                                </div>
                                <span className={styles.formContainerFormAddNode}>Can`t find what you want?<br /><span>Add It</span></span>
                                <div className={styles.formContainerFormButtons}>
                                    <button className={styles.formContainerFormRevertHalf} onClick={() => handleRevert()}>Revert Changes</button>
                                    <button className={styles.formContainerFormSubmitHalf} onClick={() => handleSubmit()}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}