import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './communities.module.css';

import CookieService from '../../services/CookieService'
import APIClient from "../../services/APIClient";
import Modals from "../components/modals";
import Head from "next/head";
import DuoMasonryLayout from "../components/masonry/duo-masonry";
import Echo from "../components/echo";
import useModalStates from "../hooks/useModalStates";
import { useSocketContext } from "../../util/SocketProvider";
import useDataStates from "../hooks/useDataStates";
import CacheService from "../../services/CacheService";
import Helpers from "../../util/Helpers";

export default function CommunitiesFeed() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [communities, setCommunities] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [echoFeed, setEchoFeed] = useState([])
    const [feedPage, setFeedPage] = useState(1)
    const {socket, socketMethods} = useSocketContext()
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [feedLoader, setFeedLoader] = useState(true)

    useEffect(() => {
        if (searchQuery.length > 0 && searchQuery.length % 3 !== 0) return;
        if (socket) {
            const updateFeed = (data) => {
                if (data.success) {
                    Helpers.setPaginatedState(data.data, setEchoFeed, data.pagination, "echoID")
                    setPagination(data.pagination)
                }
                setFeedLoader(false)
            }
            socketMethods.socketRequest("COMMUNITIES_FEED", {
                    accountID: activeUser.accountID,
                    filter: searchQuery ? searchQuery : null,
                    page: feedPage,
                    pageSize: 10
                },
                updateFeed
            )
        }
    }, [feedPage, socket])

    useEffect(() => {
        if (router.query.create) modalControl.setShowCommunityCreator(true)
    }, [router.query])

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
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && feedPage < pagination.totalPages && !feedLoader) {
            setFeedPage(feedPage + 1);
            setFeedLoader(true)
        }
    };

    return(
        <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
            <Head>
                <title>Echo - Communities</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/icon.ico" />
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
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities")} style={{color: "var(--accent)"}}>Feed</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/gallery")}>Your Communities</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/discover")}>Discover</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => modalControl.setShowCommunityCreator(true)}>Create Community</span>
                    </div>
                </div>
                <div className={styles.communitiesBody}>
                {
                    activeUser ? 
                    <DuoMasonryLayout>
                    {
                        echoFeed.length ? 
                        echoFeed.map((echo, index) => <Echo data={echo} page={pageControl} key={index} /> ) : null
                    }
                    </DuoMasonryLayout> : null
                }
                { feedLoader ? 
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