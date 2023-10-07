import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../user.module.css';

import CookieService from '../../../../services/CookieService'
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSocketContext } from '../../../../util/SocketProvider';
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import UserHead from '../../../components/user-head';
import Echo from '../../../components/echo';
import TriMasonryLayout from '../../../components/masonry/tri-masonry';
import useDataStates from '../../../hooks/useDataStates';
import CacheService from '../../../../services/CacheService';
import Helpers from '../../../../util/Helpers';

export default function UserSaved() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userSaved, setUserSaved] = useState([])
    const [savedPage, setSavedPage] = useState(1)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    })
    const [savedLoader, setSavedLoader] = useState(true)

    useEffect(() => {
        setUserSaved([])
        const updateUserData = (data) => {
            if (data.success) {
                setUserData(data.data)
            }
        }
        if (router.query.id) {
            if (socket) socketMethods.socketRequest("GET_ACCOUNT", {
                accountID: activeUser.accountID,
                userID: router.query.id
            }, updateUserData)
        }
    }, [router.query, socket])

    useEffect(() => {
        const updateUserSaved = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserSaved, data.pagination, "echoID")
                setPagination(data.pagination)
            }
            setSavedLoader(false)
        }
        if (userData) {
            if (socket) socketMethods.socketRequest("GET_SAVES", {
                accountID: activeUser.accountID,
                page: savedPage,
                pageSize: 10
            }, updateUserSaved)
        }
    }, [userData, savedPage, socket])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: userData ? `${userData.firstName} ${userData.lastName}` : "User",
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

        if (isAtBottom && savedPage < pagination.totalPages && !savedLoader) {
            setSavedPage(savedPage + 1);
            setSavedLoader(true)
        }
    };

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
            <Head>
                <title>Saved - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="saved" />

                <div className={styles.userTimeline}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>Your Saved Echoes</span>
                    </div>
                    {
                        userSaved.length ?
                        <TriMasonryLayout blocks={
                            userSaved.map((saved, index) =>
                                <Echo data={saved} page={pageControl} saved={true} key={index} />
                            )
                        } /> : null
                    }
                    {savedLoader ?
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