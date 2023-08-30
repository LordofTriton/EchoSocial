import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../people.module.css';

import Cache from '../../../services/CacheService'
import APIClient from "../../../services/APIClient";
import Modals from "../../components/modals";
import Head from "next/head";
import DuoMasonryLayout from "../../components/masonry/duo-masonry";
import Echo from "../../components/echo";
import useModalStates from "../../hooks/useModalStates";
import { useSocketContext } from "../../../util/SocketProvider";
import QuadMasonryLayout from "../../components/masonry/quad-masonry";
import UserThumb from "../../components/user-thumb";

export default function PeopleFriends() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
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
        if (socket) {
            const updatePeople = (data) => {
                if (data.success) {
                    setPeople((state) => state.concat(data.data))
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

    const createAlert = (type, message) => {
        setAlert({type, message})
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: "People",
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
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.peopleHead}>
                    <div className={styles.peopleHeadBanner}>
                        <span className={styles.peopleHeadBannerTitle}>People</span>
                        <span className={styles.peopleHeadBannerSubTitle}>Find people who share your passion. From gaming, to music, to learning, there`s a friend for you.</span>
                        <input type="text" className={styles.peopleHeadBannerSearch} />
                    </div>
                    <div className={styles.peopleHeadNav}>
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people")}>Strangers</span>
                        <span className={styles.peopleHeadNavButton} onClick={() => router.push("/people/friends")} style={{color: "var(--accent)"}}>Friends</span>
                    </div>
                </div>
                <div className={styles.peopleBody}>
                {
                    activeUser && people.length ? 
                    <QuadMasonryLayout>
                    {
                        people.map((person, index) => 
                            <UserThumb data={person} page={pageControl} key={index} />
                        )
                    }
                    </QuadMasonryLayout> : null
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