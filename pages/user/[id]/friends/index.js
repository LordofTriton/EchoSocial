import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../user.module.css';

import CookieService from '../../../../services/CookieService'
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import useDataStates from '../../../hooks/useDataStates';
import { useSocketContext } from '../../../../util/SocketProvider';
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import UserHead from '../../../components/user-head';
import CacheService from '../../../../services/CacheService';
import Helpers from '../../../../util/Helpers';

export default function UserFriends() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()
    const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userFriends, setUserFriends] = useState([])
    const [friendPage, setFriendPage] = useState(1)
    const [friendLoader, setFriendLoader] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    })

    useEffect(() => {
        setUserFriends([])
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
        const updateUserFriends = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserFriends, data.pagination, "accountID")
                setPagination(data.pagination)
            }
            setFriendLoader(false)
        }
        if (userData) {
            if (socket) socketMethods.socketRequest("GET_FRIENDS", {
                accountID: activeUser.accountID,
                userID: router.query.id,
                page: friendPage,
                pageSize: 10
            }, updateUserFriends)
        }
    }, [userData, socket])

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
        socket,
        createAlert,
        ...modalStates,
        ...modalControl,
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtBottom && friendPage < pagination.totalPages && !friendLoader) {
            setFriendPage(friendPage + 1);
            setFriendLoader(true)
        }
    };

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
            <Head>
                <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="friends" />

                <div className={styles.userFriends}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : userData ? `${userData.firstName}'s ` : ""}Friends</span>
                    </div>
                    {
                        userFriends.length ?
                        <QuadMasonryLayout blocks={
                            userFriends.map((friend, index) => 
                                <UserThumb data={friend} page={pageControl} key={index} />
                            )
                        } /> : null
                    }
                    
                    {friendLoader ?
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