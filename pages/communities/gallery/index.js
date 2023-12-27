import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../communities.module.css';

import CacheService from '../../../services/CacheService'
import APIClient from "../../../services/APIClient";
import Modals from "../../components/modals";
import TriMasonryLayout from "../../components/masonry/tri-masonry";
import CommunityThumb from "../../components/community-thumb";
import useModalStates from "../../hooks/useModalStates";
import { useSSEContext } from "../../../util/SocketProvider";
import useDataStates from "../../hooks/useDataStates";
import Helpers from "../../../util/Helpers";

export default function CommunitiesFeed() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [communities, setCommunities] = useState([])
    const [searchedCommunities, setSearchedCommunities] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    
    const [communitiesPage, setCommunitiesPage] = useState(1)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [communityLoader, setCommunityLoader] = useState(true)

    const fetchCommunities = () => {
        setCommunityLoader(true)
        const updateCommunities = (data) => {
            if (data.success) {
                if (data.data.length > 0) Helpers.setPaginatedState(data.data, searchQuery.length > 0 ? setSearchedCommunities : setCommunities, data.pagination, "communityID")
                else searchQuery.length > 0 ? setSearchedCommunities([]) : setCommunities([])
                setPagination(data.pagination)
            } else createAlert("error", data.message)
            setCommunityLoader(false)
        }
        APIClient.get(APIClient.routes.getCommunities, {
            accountID: activeUser.accountID,
            userID: activeUser.accountID,
            member: true,
            page: communitiesPage,
            pageSize: 10,
            filter: searchQuery.length ? searchQuery : null
        }, updateCommunities)
    }
    
    useEffect(() => {
        fetchCommunities()
    }, [communitiesPage])

    useEffect(() => {
        if (searchQuery.length < 3 || communityLoader) return;
        if (communitiesPage !== 1) setCommunitiesPage(1)
        else fetchCommunities()
        if (searchQuery.length < 1) setSearchedCommunities([])
    }, [searchQuery])

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "Communities",
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
                <link rel="icon" href="/newLogoIcon.ico" />
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
                    {
                        communities.length > 0 && searchQuery.length < 1 ?
                        <TriMasonryLayout blocks={
                            communities && communities.length > 0 ?
                            communities.map((community, index) => 
                            <CommunityThumb data={community} page={pageControl} member={true} key={index} />
                            ) : null
                        } />
                        :
                        !communityLoader && searchQuery.length < 1 ? <span className={styles.communityNull}>{`You haven't joined any communities.`}</span> : null
                    }
                    {
                        searchedCommunities.length > 0 && searchQuery.length > 0 ?
                        <TriMasonryLayout blocks={
                            searchedCommunities && searchedCommunities.length > 0 ?
                            searchedCommunities.map((community, index) => 
                            <CommunityThumb data={community} page={pageControl} member={true} key={index} />
                            ) : null
                        } />
                        :
                        !communityLoader && searchQuery.length > 0 ? <span className={styles.communityNull}>Sorry, there are no communities that match your search query. Please try another.</span> : null
                    }
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