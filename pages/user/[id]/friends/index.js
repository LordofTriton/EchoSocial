import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../user.module.css';

import Cache from '../../../../services/CacheService'
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSocketContext } from '../../../../util/SocketProvider';
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import UserHead from '../../../components/user-head';

export default function UserFriends() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userFriends, setUserFriends] = useState([])
    const { modalStates, modalControl } = useModalStates()
    const [friendPage, setFriendPage] = useState(1)
    const { socket, socketMethods } = useSocketContext()
    const [friendLoader, setFriendLoader] = useState(true)

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
                setUserFriends((state) => state.concat(data.data))
            }
            setFriendLoader(false)
        }
        if (userData) {
            if (socket) socketMethods.socketRequest("GET_FRIENDS", {
                accountID: activeUser.accountID,
                userID: router.query.id
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
        cache: Cache,
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
        ...modalControl
    }

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
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
                        <QuadMasonryLayout>
                            {
                                userFriends.map((friend, index) => 
                                    <UserThumb data={friend} page={pageControl} key={index} />
                                )
                            }
                        </QuadMasonryLayout> : null
                    }
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}