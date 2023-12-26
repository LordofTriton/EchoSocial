import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../../community.module.css';

import CacheService from '../../../../../services/CacheService'
import Echo from "../../../../components/echo";
import APIClient from "../../../../../services/APIClient";
import SVGServer from "../../../../../services/svg/svgServer";
import Modals from '../../../../components/modals';
import useModalStates from '../../../../hooks/useModalStates';
import { useSSEContext } from '../../../../../util/SocketProvider';
import DateGenerator from '../../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../../components/masonry/duo-masonry';
import { Form } from '../../../../components/form';
import CommunityHead from '../../../../components/community-head';
import useDataStates from '../../../../hooks/useDataStates';

export default function CommunitySettings() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [communityData, setCommunityData] = useState(null)
    const [communityNodes, setCommunityNodes] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [nodeList, setNodeList] = useState([])
    const [alert, setAlert] = useState(null)

    useEffect(() => {
        const updateCommunityData = (data) => {
            if (data.success) {
                setCommunityData(data.data);
                setCommunityNodes(data.data.nodes)
            } else createAlert("error", data.message)
        }
        if (router.query.id) {
            APIClient.get(APIClient.routes.getCommunity, {
                accountID: activeUser.accountID,
                communityID: router.query.id
            }, updateCommunityData)
        }
    }, [router.query])

    useEffect(() => {
        updateNodeList()
    }, [searchQuery])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const updateNodeList = async () => {
        if (searchQuery.length % 2 === 0) {
            const query = String(searchQuery).toLowerCase().replace(/\s/g, "").trim()
            const updateNodes = (data) => data.success ? setNodeList(data.data) : null;
            APIClient.get(APIClient.routes.getNodes, {
                accountID: activeUser.accountID,
                filter: query,
                page: 1,
                pageSize: 10
            }, updateNodes)
        }
    }

    const pageControl = {
        title: communityData ? `${communityData.displayName}` : "Community",
        community: communityData ? {
            communityID: communityData.communityID,
            communityName: communityData.displayName,
            communityNodes: communityData.nodes,
            communityNode: communityData.node
        } : null,
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

    const handleSubmit = async () => {
        APIClient.post(APIClient.routes.updateCommunity, {
            accountID: activeUser.accountID,
            communityID: router.query.id,
            nodes: communityData.nodes
        })
        createAlert("success", "Settings updated successfully.")
        CacheService.saveData("EchoActiveUser", {...activeUser, nodes: communityNodes})
        updateNodeList()
    }

    const handleRevert = () => {
        setCommunityNodes(communityData.nodes)
    }

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <CommunityHead data={communityData} page={pageControl} />

                <div className={styles.communityFriends}>
                    <div className={styles.communityTimelineFeedHead}>
                        <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Settings</span>
                    </div>
                    <div className={styles.communitySettings}>
                        <div className={styles.communitySettingsNav}>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings`)}>General</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/nodes`)} style={{ color: "var(--accent)" }}>Nodes</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)}>Pending Applications</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)}>Blacklist</span>
                        </div>
                        <div className={styles.communitySettingsBody}>
                            <span className={styles.communitysettingsBodyTitle}>Community Nodes</span>
                            <div className={styles.communitySettingsBodyContent}>
                            <div className={styles.communitySettingsNodeList}>
                                    <div style={{ display: "inline-block" }}>
                                        {
                                            communityNodes.length ?
                                            communityNodes.map((node, index) =>
                                                    <span key={index} className={styles.communitySettingsSelectedNode}>
                                                        {node.emoji} {node.displayName}
                                                        <span onClick={() => setCommunityNodes(communityNodes.filter((item) => item.nodeID !== node.nodeID))}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                                                    </span>
                                                ) : null
                                        }
                                    </div>
                                </div>
                                <div className={styles.communitySettingsNodeSelector}>
                                    <Form.TextInput
                                        label="Search Nodes"
                                        style={{ width: "100%", float: "right", marginBottom: "20px" }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search hobbies and interests."
                                    />
                                    <div className={styles.communitySettingsNodeSelectorNodeBox}>
                                        <span className={styles.communitySettingsSelectorNodes}>
                                            {
                                                nodeList && nodeList.length > 0 ?
                                                    nodeList.map((node, index) =>
                                                        <span
                                                            key={index}
                                                            className={styles.communitySettingsSelectorNode}
                                                            style={{ backgroundColor: communityNodes.find((item) => item.nodeID === node.nodeID) ? "var(--primary)" : "var(--accent)" }}
                                                            onClick={() => communityNodes.find((item) => item.nodeID === node.nodeID) ? setCommunityNodes(communityNodes.filter((item) => item.name !== node.name)) : setCommunityNodes(communityNodes.concat(node))}
                                                        >
                                                            {node.emoji} {node.displayName}
                                                        </span>
                                                    ) : null
                                            }
                                            <span className={styles.communitySettingsSelectorNode} style={{ width: "40px", height: "40px", padding: "5px" }} onClick={() => modalControl.setShowNodeCreator(true)}><SVGServer.AddIcon color="var(--surface)" width="30px" height="30px" /></span>
                                        </span>
                                    </div>
                                </div>
                                {/* <span className={styles.communitySettingsAddNode}>Can`t find what you want?<br /><span>Add It</span></span> */}
                                <div className={styles.communitySettingsButtons}>
                                    <button className={styles.communitySettingsFormRevertHalf} onClick={() => handleRevert()}>Revert Changes</button>
                                    <button className={styles.communitySettingsFormSubmitHalf} onClick={() => handleSubmit()}>Save Changes</button>
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