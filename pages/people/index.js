import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './people.module.css';

import CacheService from '../../services/CacheService'
import APIClient from "../../services/APIClient";
import Modals from "../components/modals";
import Head from "next/head";
import DuoMasonryLayout from "../components/masonry/duo-masonry";
import Echo from "../components/echo";
import useModalStates from "../hooks/useModalStates";
import { useSSEContext } from "../../util/SocketProvider";
import QuadMasonryLayout from "../components/masonry/quad-masonry";
import UserThumb from "../components/user-thumb";
import useDataStates from "../hooks/useDataStates";
import Helpers from "../../util/Helpers";

export default function PeopleStrangers() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [people, setPeople] = useState([])
    const [searchedPeople, setSearchedPeople] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [peoplePage, setPeoplePage] = useState(1)
    const { sse, sseListener, sseDeafener } = useSSEContext()
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [peopleLoader, setPeopleLoader] = useState(true)

    const fetchPeople = () => {
        setPeopleLoader(true)
        if (socket) {
            const updatePeople = (data) => {
                if (data.success) {
                    if (data.data.length > 0) Helpers.setPaginatedState(data.data, searchQuery.length > 0 ? setSearchedPeople : setPeople, data.pagination, "accountID")
                    else searchQuery.length > 0 ? setSearchedPeople([]) : setPeople([]);
                    setPagination(data.pagination)
                }
                setPeopleLoader(false)
            }
            APIClient.get(APIClient.routes.getAccounts, {
                accountID: activeUser.accountID,
                friends: false,
                page: peoplePage,
                pageSize: 10,
                filter: searchQuery.length ? searchQuery : null
            }, updatePeople)
        }
    }
    
    useEffect(() => {
        fetchPeople()
    }, [peoplePage])

    
    useEffect(() => {
        if (searchQuery.length < 3 || peopleLoader) return;
        if (peoplePage !== 1) setPeoplePage(1)
        else fetchPeople()
        if (searchQuery.length < 1) setSearchedPeople([])
    }, [searchQuery])

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "People",
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

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && peoplePage < pagination.totalPages && !peopleLoader) {
            setPeoplePage(peoplePage + 1);
            setPeopleLoader(true)
        }
    };

    return(
        <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
            <Head>
                <title>Echo - People</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.peopleHead}>
                    <div className={styles.peopleHeadBanner}>
                        <span className={styles.peopleHeadBannerTitle}><span className="titleGradient">People</span></span>
                        <span className={styles.peopleHeadBannerSubTitle}>Find people who share your passion. From gaming, to music, to learning, there`s a friend for you.</span>
                        <input type="text" className={styles.peopleHeadBannerSearch} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className={styles.peopleHeadNav}>
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people")} style={{color: "var(--accent)"}}>Strangers</span>
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people/friends")}>Friends</span>
                    </div>
                </div>
                <div className={styles.peopleBody}>
                {
                    activeUser && people.length > 0 && searchQuery.length < 1 ? 
                    <QuadMasonryLayout blocks={
                        people.map((person, index) => 
                            <UserThumb data={person} page={pageControl} key={index} />
                        )
                    } /> : !peopleLoader && searchQuery.length < 1 ? <span className={styles.peopleNull}>{`Sorry, we couldn't find anyone that matches your nodes. Consider adding more nodes.`}</span> : null
                }
                {
                    activeUser && searchedPeople.length > 0 && searchQuery.length > 1 ? 
                    <QuadMasonryLayout blocks={
                        searchedPeople.map((person, index) => 
                            <UserThumb data={person} page={pageControl} key={index} />
                        )
                    } /> : !peopleLoader && searchQuery.length > 1 ? <span className={styles.peopleNull}>{`Sorry, we couldn't find anyone that matches your search query.`}</span> : null
                }
                { peopleLoader ? 
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