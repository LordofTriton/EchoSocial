import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../people.module.css';

import CookieService from '../../../services/CookieService'
import APIClient from "../../../services/APIClient";
import Modals from "../../components/modals";
import Head from "next/head";
import DuoMasonryLayout from "../../components/masonry/duo-masonry";
import Echo from "../../components/echo";
import useModalStates from "../../hooks/useModalStates";
import { useSocketContext } from "../../../util/SocketProvider";
import QuadMasonryLayout from "../../components/masonry/quad-masonry";
import UserThumb from "../../components/user-thumb";
import useDataStates from "../../hooks/useDataStates";
import CacheService from "../../../services/CacheService";
import Helpers from "../../../util/Helpers";

export default function PeopleFriends() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [people, setPeople] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [peoplePage, setPeoplePage] = useState(1)
    const {socket, socketMethods} = useSocketContext()
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
    const [peopleLoader, setPeopleLoader] = useState(true)

    useEffect(() => {
        if (searchQuery.length > 1) return;
        if (socket) {
            const updatePeople = (data) => {
                if (data.success) {
                    Helpers.setPaginatedState(data.data, setPeople, data.pagination, "accountID")
                    setPagination(data.pagination)
                }
                setPeopleLoader(false)
            }
            socketMethods.socketRequest("GET_ACCOUNTS", {
                    accountID: activeUser.accountID,
                    friends: true,
                    page: peoplePage,
                    pageSize: 10
                },
                updatePeople
            )
        }
    }, [peoplePage, socket])

    useEffect(() => {
        if (socket && searchQuery.length % 3 === 0 && !peopleLoader) {
            const updatePeople = (data) => {
                if (data.success) {
                    Helpers.setPaginatedState(data.data, setPeople, data.pagination, "accountID")
                    setPagination(data.pagination)
                }
                setPeopleLoader(false)
            }
            socketMethods.socketRequest("GET_ACCOUNTS", {
                accountID: activeUser.accountID,
                friends: true,
                page: 1,
                pageSize: 10,
                filter: searchQuery.length ? searchQuery : null
            }, updatePeople)
        }
    }, [peoplePage, searchQuery, socket])

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "People",
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
                <link rel="icon" href="/icon.ico" />
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
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people")}>Strangers</span>
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people/friends")} style={{color: "var(--accent)"}}>Friends</span>
                    </div>
                </div>
                <div className={styles.peopleBody}>
                {
                    activeUser && people.length ? 
                    <QuadMasonryLayout blocks={
                        people.map((person, index) => 
                            <UserThumb data={person} page={pageControl} key={index} />
                        )
                    } /> : null
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