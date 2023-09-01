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
import TriMasonryLayout from '../../../components/masonry/tri-masonry';
import Echo from '../../../components/echo';
import Helpers from '../../../../util/Helpers';
import UserHead from '../../../components/user-head';

export default function UserMedia() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userMediaEchoes, setUserMediaEchoes] = useState([])
    const {modalStates, modalControl} = useModalStates()
    const [showAllCommunities, setShowAllCommunities] = useState(false)
    const [echoPage, setEchoPage] = useState(1)
    const {socket, socketMethods} = useSocketContext()
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    })
    const [echoLoader, setEchoLoader] = useState(true)

    useEffect(() => {
        setUserMediaEchoes([])
        const updateUserData = (data) => {
            if (data.success) {
                setUserData(data.data)
            }
        }
        const showEcho = (data) => data.success ? modalControl.setShowEchoViewer(data.data) : null
        if (router.query.id) {
            if (socket) socketMethods.socketRequest("GET_ACCOUNT", {
                accountID: activeUser.accountID,
                userID: router.query.id
            }, updateUserData)
        }
        if (router.query.echo) {
            if (socket) socketMethods.socketRequest("GET_ECHO", {
                accountID: activeUser.accountID,
                echoID: router.query.echo
            }, showEcho)
        }
    }, [router.query, socket])

    useEffect(() => {
        const updateMediaEchoes = (data) => {
            if (data.success) {
                setUserMediaEchoes((state) => state.concat(data.data))
                setPagination(data.pagination)
            }
            setEchoLoader(false)
        }
        if (userData) {
            if (socket) socketMethods.socketRequest("USER_FEED", {
                accountID: activeUser.accountID,
                userID: router.query.id,
                hasMedia: true,
                page: echoPage,
                pageSize: 7
            }, updateMediaEchoes)
        }
    }, [userData, echoPage, socket])

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

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtBottom && echoPage < pagination.totalPages && !echoLoader) {
            setEchoPage(echoPage + 1);
            setEchoLoader(true)
        }
    };

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
            <Head>
                <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="media" />

                <div className={styles.userTimeline}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : userData ? `${userData.firstName}'s ` : ""}Photos & Videos</span>
                    </div>
                    <TriMasonryLayout>
                    {
                        userMediaEchoes.length > 0 ?
                        userMediaEchoes.map((echo) => 
                            echo.content.media.map((media, index) => 
                                <>
                                { Helpers.getFileType(media.url) === "image" ? <img className={styles.userMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} alt="media" /> : null }
                                { Helpers.getFileType(media.url) === "video" ? <video className={styles.userMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} /> : null }
                                </>
                            )
                        ) : null
                    }
                    </TriMasonryLayout>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}