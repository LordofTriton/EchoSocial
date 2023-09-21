import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../communities.module.css';

import CookieService from '../../../services/CookieService'
import APIClient from "../../../services/APIClient";
import Modals from "../../components/modals";
import TriMasonryLayout from "../../components/masonry/tri-masonry";
import CommunityThumb from "../../components/community-thumb";
import useModalStates from "../../hooks/useModalStates";
import { useSocketContext } from "../../../util/SocketProvider";
import useDataStates from "../../hooks/useDataStates";
import CacheService from "../../../services/CacheService";

export default function CommunitiesFeed() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const {dataStates, dataControl} = useDataStates()
    const [communities, setCommunities] = useState(dataStates.galleryCommunities || [])
    const [searchQuery, setSearchQuery] = useState("")
    const {socket, socketMethods} = useSocketContext()
    const [communitiesPage, setCommunitiesPage] = useState(1)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [communityLoader, setCommunityLoader] = useState(true)

    useEffect(() => {
        if (searchQuery.length > 0) return;
        if (socket) {
            const updateCommunities = (data) => {
                if (data.success) {
                    if (communitiesPage === 1) {
                        setCommunities(data.data)
                        if (communitiesPage < 2) dataControl.setGalleryCommunities(data.data)
                    }
                    else {
                        setCommunities((state) => state.concat(data.data))
                        if (communitiesPage < 2) dataControl.setGalleryCommunities(communities.concat(data.data))
                    }
                    setPagination(data.pagination)
                }
                setCommunityLoader(false)
            }
            socketMethods.socketRequest("GET_COMMUNITIES", {
                    accountID: activeUser.accountID,
                    userID: activeUser.accountID,
                    member: true,
                    page: communitiesPage,
                    pageSize: 10
                },
                updateCommunities
            )
        }
    }, [communitiesPage, socket])

    useEffect(() => {
        if (socket && searchQuery.length % 3 === 0 && !communityLoader) {
            const updateCommunities = (data) => {
                if (data.success) {
                    setCommunities(data.data)
                    setPagination(data.pagination)
                }
                setCommunityLoader(false)
            }
            socketMethods.socketRequest("GET_COMMUNITIES", {
                    accountID: activeUser.accountID,
                    userID: activeUser.accountID,
                    member: true,
                    page: 1,
                    pageSize: 10,
                    filter: searchQuery.length ? searchQuery : null
                },
                updateCommunities
            )
        }
    }, [communitiesPage, searchQuery, socket])

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "Communities",
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
        ...dataStates,
        ...dataControl
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && communitiesPage < pagination.totalPages && !communityLoader) {
            setCommunitiesPage(communitiesPage + 1);
            setCommunityLoader(true)
        }
    };

    return(
        <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
            <Head>
                <title>Echo - Communities</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.communitiesHead}>
                    <div className={styles.communitiesHeadBanner}>
                        <span className={styles.communitiesHeadBannerTitle}><span className="titleGradient">Communities</span></span>
                        <span className={styles.communitiesHeadBannerSubTitle}>Find people who share your passion. From gaming, to music, to learning, there`s a place for you.</span>
                        <input type="text" className={styles.communitiesHeadBannerSearch} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className={styles.communitiesHeadNav}>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities")}>Feed</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/gallery")} style={{color: "var(--accent)"}}>Your Communities</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/discover")}>Discover</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => modalControl.setShowCommunityCreator(true)}>Create Community</span>
                    </div>
                </div>
                <div className={styles.communitiesBody}>
                    <TriMasonryLayout>
                        {
                            communities && communities.length > 0 ?
                            communities.map((community, index) => 
                            <CommunityThumb data={community} page={pageControl} member={true} key={index} />
                            ) : null
                        }
                    </TriMasonryLayout>
                    { communityLoader ? 
                        <div className="loader" style={{
                            width: "70px",
                            height: "70px",
                            borderWidth: "7px",
                            borderColor: "var(--primary) transparent",
                            margin: "100px calc(50% - 35px) 0px calc(50% - 35px)"
                        }}></div>  : null
                    }
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}