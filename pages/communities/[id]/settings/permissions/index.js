import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../../community.module.css';

import Cache from '../../../../../services/CacheService'
import Echo from "../../../../components/echo";
import APIClient from "../../../../../services/APIClient";
import SVGServer from "../../../../../services/svg/svgServer";
import Modals from '../../../../components/modals';
import useModalStates from '../../../../hooks/useModalStates';
import { useSocketContext } from '../../../../../util/SocketProvider';
import DateGenerator from '../../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../../components/masonry/duo-masonry';
import { Form } from '../../../../components/form';
import CommunityHead from '../../../../components/community-head';

export default function CommunitySettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [communityData, setCommunityData] = useState(null)
    const [updatedCommunityData, setUpdatedCommunityData] = useState({
      entryApproval: false,
      echoApproval: false
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()

    useEffect(() => {
        const updateCommunityData = (data) => {
            if (data.success) {
                setCommunityData(data.data);
                setUpdatedCommunityData(data.data)
            }
        }
        if (router.query.id && socket) {
            socketMethods.socketRequest("GET_COMMUNITY", {
                accountID: activeUser.accountID,
                communityID: router.query.id
            }, updateCommunityData)
        }
    }, [router.query, socket])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: communityData ? `${communityData.displayName}` : "Community",
        community: communityData ? {
            communityID: communityData.communityID,
            communityName: communityData.displayName,
            communityNodes: communityData.nodes
        } : null,
        router,
        cache: Cache,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        socket,
        socketMethods,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl
    }

    const handleSubmit = async () => {
        if (!socket) return;
        socketMethods.socketEmitter("UPDATE_COMMUNITY", {
            accountID: activeUser.accountID,
            communityID: communityData.communityID,
            ...updatedCommunityData
        })
        createAlert("success", "Permissions updated succesfully.")
    }

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
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
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)} style={{ color: "var(--accent)" }}>Pending Applications</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)}>Blacklist</span>
                        </div>
                        <div className={styles.communitySettingsBody}>
                            <span className={styles.communitysettingsBodyTitle}>Pending Applications</span>
                            <div className={styles.communitySettingsBodyContent}>
                                <div className={styles.communitySettingsSwitchBar}>
                                    <Form.SwitchInput
                                        value={updatedCommunityData.entryApproval}
                                        style={{ float: "left" }}
                                        onChange={(value) => setUpdatedCommunityData({...updatedCommunityData, entryApproval: value})}
                                    />
                                    <span className={styles.communitySettingsSwitchBarText}>Entry Approval<br /><span>Allows only approved users to join the community.</span></span>
                                </div>
                                <div className={styles.communitySettingsFormButtons}>
                                    <button className={styles.communitySettingsFormRevertHalf} onClick={() => setUpdatedCommunityData(communityData)}>Revert Changes</button>
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