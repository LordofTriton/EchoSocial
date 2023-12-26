import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../user.module.css';

import CacheService from '../../../../services/CacheService'
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSSEContext } from '../../../../util/SocketProvider';
import TriMasonryLayout from '../../../components/masonry/tri-masonry';
import Echo from '../../../components/echo';
import Helpers from '../../../../util/Helpers';
import UserHead from '../../../components/user-head';
import useDataStates from '../../../hooks/useDataStates';

function VideoMedia({ source, callback }) {
    const handleClick = () => {
      const el = document.getElementById(`VideoMedia_${source}`)
      if (el) el.pause()
    }
    useEffect(() => { setTimeout(() => handleClick(), 15000) }, [])
    return ( <video className={styles.userMediaVideo} src={source} id={`VideoMedia_${source}`} onClick={() => callback()} autoPlay muted /> )
}

export default function UserMedia() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const [userMediaEchoes, setUserMediaEchoes] = useState([])
    const [echoPage, setEchoPage] = useState(1)
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
            } else createAlert("error", data.message)
        }
        const showEcho = (data) => data.success ? modalControl.setShowEchoViewer(data.data) : null
        if (router.query.id) {
            APIClient.get(APIClient.routes.getAccount, {
                accountID: activeUser.accountID,
                userID: router.query.id
            }, updateUserData)
        }
        if (router.query.echo) {
            APIClient.get(APIClient.routes.getEcho, {
                accountID: activeUser.accountID,
                echoID: router.query.echo
            }, showEcho)
        }
    }, [router.query])

    useEffect(() => {
        const updateMediaEchoes = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserMediaEchoes, data.pagination, "echoID")
                setPagination(data.pagination)
            } else createAlert("error", data.message)
            setEchoLoader(false)
        }
        if (userData) {
            APIClient.get(APIClient.routes.getuserFeed, {
                accountID: activeUser.accountID,
                userID: router.query.id,
                hasMedia: true,
                page: echoPage,
                pageSize: 7
            }, updateMediaEchoes)
        }
    }, [userData, echoPage])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    const pageControl = {
        title: userData ? `${userData.firstName} ${userData.lastName}` : "User",
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
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="media" />

                <div className={styles.userTimeline}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : userData ? `${userData.firstName}'s ` : ""}Photos & Videos</span>
                    </div>
                    {
                        userMediaEchoes.length > 0 ?
                        <TriMasonryLayout blocks={
                            userMediaEchoes.length > 0 ?
                            userMediaEchoes.map((echo) => 
                                echo.content.media.map((media, index) => 
                                    <>
                                    { Helpers.getFileType(media.url) === "image" ? <div className={styles.userMediaItem}><img className={styles.userMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} alt="media" /></div> : null }
                                    { Helpers.getFileType(media.url) === "video" ? 
                                        <div className={styles.userMediaItem}>
                                        <VideoMedia source={media.url} callback={() => modalControl.setShowEchoViewer(echo)} />
                                        <div className={styles.userMediaVideoOverlay}>
                                            <span>
                                                <SVGServer.PlayIcon color="var(--primary)" width="50px" height="50px" />
                                            </span>
                                        </div>
                                        </div> : null 
                                    }
                                    </>
                                )
                            ) : null
                        } />
                        : !echoLoader ? <span className={styles.userNull}>Nothing to show - {router.query.id === activeUser.accountID ? 'You have' : 'This user has'} no pictures or videos{router.query.id !== activeUser.accountID ? ' you can see' : ''}.</span> : null
                    }
                    
                    {echoLoader ?
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