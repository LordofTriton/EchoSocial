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
import Helpers from '../../../../../util/Helpers';

export default function CommunitySettings() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    const { sse, sseListener, sseDeafener } = useSSEContext()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [communityData, setCommunityData] = useState(null)
    const [communityBanned, setCommunityBanned] = useState([])
    const [alert, setAlert] = useState(null)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [bannedLoader, setBannedLoader] = useState(true)
    const [bannedPage, setBannedPage] = useState(1)

    useEffect(() => {
        const updateCommunityData = (data) => (data.success) ? setCommunityData(data.data) : null;
        if (router.query.id) {
            APIClient.get(APIClient.routes.getCommunity, {
                accountID: activeUser.accountID,
                communityID: router.query.id
            }, updateCommunityData)
        }
    }, [router.query])

    useEffect(() => {
        const updateCommunityBanned = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setCommunityBanned, data.pagination, "accountID")
                setPagination(data.pagination)
            }
            setBannedLoader(false)
        }
        if (router.query.id) {
            APIClient.get(APIClient.routes.getBlacklist, {
                accountID: activeUser.accountID,
                blocker: router.query.id,
                page: bannedPage,
                pageSize: 10
            }, updateCommunityBanned)
        }
    }, [router.query, bannedPage])

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
        cookies: CacheService,
        cache: CacheService,
        activeUser,
        setActiveUser,
        activeTheme,
        setActiveTheme,
        sse,
        sseListener,
        sseDeafener,
        alert,
        createAlert,
        ...modalStates,
        ...modalControl,
    }

    const handleLiftBan = async (blockee) => {
        APIClient.del(APIClient.routes.deleteBlacklist, {
            accountID: activeUser.accountID,
            blocker: communityData.communityID,
            blockee
        })
        setCommunityBanned(communityBanned.filter((obj) => obj.blockee !== blockee))
        createAlert("success", "Ban lifted succesfully.")
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
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/nodes`)}>Nodes</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)}>Pending Applications</span>
                            <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)} style={{ color: "var(--accent)" }}>Blacklist</span>
                        </div>
                        <div className={styles.communitySettingsBody}>
                            <span className={styles.communitysettingsBodyTitle}>Blacklisted Users</span>
                            <div className={styles.communitySettingsBodyContent}>
                            {
                                communityBanned.length > 0 ?
                                    communityBanned.map((banned, index) => 
                                        <div className={styles.communityMember} key={index} style={{backgroundColor: "var(--base)"}}>
                                            <div className={styles.communityMemberProfile} style={{backgroundImage: `url(${banned.profileImage.url})`}}></div>
                                            <span className={styles.communityMemberName} style={{color: "var(--primary)", marginTop: "10px"}}>{banned.firstName} {banned.lastName}</span>
                                            <div className={styles.communityMemberOptions}>
                                                <SVGServer.OptionIcon color="var(--primary)" width="20px" height="20px" />
                                                <div className={styles.communityMemberOptionsDrop}>
                                                    <span className={styles.communityMemberOption} onClick={() => handleLiftBan(banned.blockee)}>Lift ban</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                : <span style={{fontSize: "15px", fontWeight: "200", color: "var(--primary)"}}>There are currently no banned users to view.</span>
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