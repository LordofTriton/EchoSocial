import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../../community.module.css';

import CookieService from '../../../../../services/CookieService'
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
import useDataStates from '../../../../hooks/useDataStates';
import CacheService from '../../../../../services/CacheService';
import Helpers from '../../../../../util/Helpers';

export default function CommunitySettings() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [communityData, setCommunityData] = useState(null)
    const [communityApplications, setCommunityApplications] = useState([])
    const [alert, setAlert] = useState(null)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [applicationLoader, setApplicationLoader] = useState(true)
    const [applicationPage, setApplicationPage] = useState(1)

    useEffect(() => {
        const updateCommunityData = (data) => (data.success) ? setCommunityData(data.data) : null;
        const updateCommunityApplications = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setCommunityApplications, data.pagination, "applicationID")
                setPagination(data.pagination)
            }
            setApplicationLoader(false)
        }
        if (router.query.id && socket) {
            socketMethods.socketRequest("GET_COMMUNITY", {
                accountID: activeUser.accountID,
                communityID: router.query.id
            }, updateCommunityData)
            socketMethods.socketRequest("GET_APPLICATIONS", {
                accountID: activeUser.accountID,
                communityID: router.query.id,
                page: applicationPage,
                pageSize: 10
            }, updateCommunityApplications)
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
            communityNodes: communityData.nodes,
            communityNode: communityData.node
        } : null,
        router,
        cookies: CookieService,
        cache: CacheService,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        socket,
        socketMethods,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl,
    }

    const handleApproveApplication = async (applicationID) => {
        if (!socket) return;
        socketMethods.socketEmitter("PING_APPLICATION", {
            accountID: activeUser.accountID,
            communityID: communityData.communityID,
            applicationID,
            approve: true
        })
        setCommunityApplications(communityApplications.filter((obj) => obj.applicationID !== applicationID))
        createAlert("success", "Application approved succesfully.")
    }

    const handleDenyApplication = async (applicationID) => {
        if (!socket) return;
        socketMethods.socketEmitter("PING_APPLICATION", {
            accountID: activeUser.accountID,
            communityID: communityData.communityID,
            applicationID,
            deny: true
        })
        setCommunityApplications(communityApplications.filter((obj) => obj.applicationID !== applicationID))
        createAlert("success", "Application denied succesfully.")
    }

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/icon.ico" />
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
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/nodes`)}>Nodes</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)} style={{ color: "var(--accent)" }}>Pending Applications</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)}>Blacklist</span>
                        </div>
                        <div className={styles.communitySettingsBody}>
                            <span className={styles.communitysettingsBodyTitle}>Pending Applications</span>
                            <div className={styles.communitySettingsBodyContent}>
                            {
                                communityApplications.length > 0 ?
                                    communityApplications.map((application, index) => 
                                        <div className={styles.communityMember} key={index} style={{backgroundColor: "var(--base)"}}>
                                            <div className={styles.communityMemberProfile} style={{backgroundImage: `url(${application.profileImage.url})`}}></div>
                                            <span className={styles.communityMemberName} style={{color: "var(--primary)"}}>{application.firstName} {application.lastName}<br /><span>NEW MEMBER</span></span>
                                            <div className={styles.communityMemberOptions}>
                                                <SVGServer.OptionIcon color="var(--primary)" width="20px" height="20px" />
                                                <div className={styles.communityMemberOptionsDrop}>
                                                    <span className={styles.communityMemberOption} onClick={() => handleApproveApplication(application.applicationID)}>Approve</span>
                                                    <span className={styles.communityMemberOption} onClick={() => handleDenyApplication(application.applicationID)}>Deny</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                : <span style={{fontSize: "15px", fontWeight: "200", color: "var(--primary)"}}>There are currently no applications to view.</span>
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}