import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../communities.module.css';

import Cache from '../../../services/CacheService'
import APIClient from "../../../services/APIClient";
import Modals from "../../components/modals";
import TriMasonryLayout from "../../components/masonry/tri-masonry";
import CommunityThumb from "../../components/community-thumb";
import useModalStates from "../../hooks/useModalStates";
import { useSocketContext } from "../../../util/SocketProvider";

export default function CommunitiesFeed() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [communities, setCommunities] = useState([])
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
        if (socket) {
            const updateCommunities = (data) => {
                if (data.success) {
                    setCommunities((state) => state.concat(data.data))
                    setPagination(data.pagination)
                }
                setCommunityLoader(false)
            }
            socketMethods.socketRequest("GET_COMMUNITIES", {
                    accountID: activeUser.accountID,
                    userID: activeUser.accountID,
                    member: false,
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
                    member: false,
                    page: 1,
                    pageSize: 10,
                    filter: searchQuery.length ? searchQuery : null
                },
                updateCommunities
            )
        }
    }, [searchQuery, socket])

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "Communities",
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
                        <span className={styles.communitiesHeadBannerTitle}>Communities</span>
                        <span className={styles.communitiesHeadBannerSubTitle}>Find people who share your passion. From gaming, to music, to learning, there`s a place for you.</span>
                        <input type="text" className={styles.communitiesHeadBannerSearch} />
                    </div>
                    <div className={styles.communitiesHeadNav}>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities")}>Feed</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/gallery")}>Your Communities</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => router.push("/communities/discover")} style={{color: "var(--accent)"}}>Discover</span>
                        <span className={styles.communitiesHeadNavButton} onClick={() => modalControl.setShowCommunityCreator(true)} style={{float: "right"}}>Create New Community</span>
                    </div>
                </div>
                <div className={styles.communitiesBody}>
                    <TriMasonryLayout>
                        {
                            communities && communities.length > 0 ?
                            communities.map((community, index) => 
                            <CommunityThumb data={community} page={pageControl} member={false} key={index} />
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