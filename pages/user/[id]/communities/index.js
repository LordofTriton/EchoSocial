import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../user.module.css';

import CacheService from '../../../../services/CacheService'
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import useDataStates from '../../../hooks/useDataStates';
import { useSSEContext } from '../../../../util/SocketProvider';
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import CommunityThumb from '../../../components/community-thumb';
import UserHead from '../../../components/user-head';
import Helpers from '../../../../util/Helpers';

export default function UserCommunities() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userCommunities, setUserCommunities] = useState([])
    const [communityPage, setCommunityPage] = useState(1)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    })
    const [communityLoader, setCommunityLoader] = useState(true)

    useEffect(() => {
        setUserCommunities([])
        const updateUserData = (data) => {
            if (data.success) {
                setUserData(data.data)
            } else createAlert("error", data.message)
        }
        if (router.query.id) {
            APIClient.get(APIClient.routes.getAccount, {
                accountID: activeUser.accountID,
                userID: router.query.id
            }, updateUserData)
        }
    }, [router.query])

    useEffect(() => {
        const updateUserCommunities = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserCommunities, data.pagination, "communityID")
                setPagination(data.pagination)
            } else createAlert("error", data.message)
            setCommunityLoader(false)
        }
        if (userData) {
            APIClient.get(APIClient.routes.getCommunities, {
                accountID: activeUser.accountID,
                userID: router.query.id,
                member: true,
                page: communityPage,
                pageSize: 10
            }, updateUserCommunities)
        }
    }, [userData, communityPage])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: userData ? `${userData.firstName} ${userData.lastName}` : "User",
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

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtBottom && communityPage < pagination.totalPages && !communityLoader) {
            setCommunityPage(communityPage + 1);
            setCommunityLoader(true)
        }
    };

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
            <Head>
                <title>Community - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="communities" />

                <div className={styles.userTimeline}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : userData ? `${userData.firstName}'s ` : ""}Communities</span>
                    </div>
                    {
                        userCommunities.length ?
                            <QuadMasonryLayout blocks={
                                userCommunities.map((community, index) =>
                                    <CommunityThumb data={community} page={pageControl} member={community.userMember} key={index} />
                                )
                            } /> : <span className={styles.userNull}>Nothing to show - {router.query.id === activeUser.accountID ? 'You have' : 'This user has'} no communities{router.query.id !== activeUser.accountID ? ' you can see' : ''}.</span>
                    }
                    
                    {communityLoader ?
                        <div className="loader" style={{
                            width: "70px",
                            height: "70px",
                            borderWidth: "7px",
                            borderColor: "var(--primary) transparent",
                            margin: "100px calc(50% - 35px) 0px calc(50% - 35px)"
                        }}></div> : null
                    }
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}