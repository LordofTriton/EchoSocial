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

export default function UserFriends() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
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
        socket,
        socketMethods,
        alert,
        socket,
        createAlert,
        ...modalStates,
        ...modalControl
    }

    const handleUpdateProfileCover = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (userData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileCover.publicID}`);
        setUserData({ ...userData, profileCover: uploadedFile.data[0] })

        if (socket) socketMethods.socketEmitter("UPDATE_ACCOUNT", {
            accountID: activeUser.accountID,
            profileCover: uploadedFile.data[0]
        })
        Cache.saveData("EchoUser", { ...userData, profileCover: uploadedFile.data[0] })
        setActiveUser({ ...activeUser, profileCover: uploadedFile.data[0] })
    }

    const handleUpdateProfileImage = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (userData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileImage.publicID}`);
        setUserData({ ...userData, profileImage: uploadedFile.data[0] })

        if (socket) socketMethods.socketEmitter("UPDATE_ACCOUNT", {
            accountID: activeUser.accountID,
            profileImage: uploadedFile.data[0]
        })
        Cache.saveData("EchoUser", { ...userData, profileImage: uploadedFile.data[0] })
        setActiveUser({ ...activeUser, profileImage: uploadedFile.data[0] })
    }

    const handleFollowButtonClick = async () => {
        if (!socket) return;
        if (userData.userHearted) setUserData({ ...userData, userHearted: false, hearts: userData.hearts - 1 })
        else setUserData({ ...userData, userHearted: true, hearts: userData.hearts + 1 })

        if (activeUser.accountID !== userData.accountID) socketMethods.socketEmitter(userData.userHearted ? "DELETE_HEART" : "CREATE_HEART", {
            accountID: activeUser.accountID,
            userID: userData.accountID
        })
    }

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/favicon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeUser.dark ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <div className={styles.userHead}>
                    <div className={styles.userHeadCover} style={{ backgroundImage: userData ? `url(${userData.profileCover.url})` : null }}></div>
                    <div className={styles.userHeadNav}>
                        <div className={styles.userHeadNavThird}>
                            <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}`)}>Timeline</span>
                            <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/about`)}>About</span>
                            <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/friends`)} style={{ color: "var(--accent)" }}>Friends</span>
                        </div>
                        <div className={styles.userHeadNavThird}>
                            <span className={styles.userHeadNavName}>{userData ? `${userData.firstName} ${userData.lastName}` : ""}</span>
                            <span className={styles.userHeadNavNickName}>{userData ? userData.nickname : ""}</span>
                        </div>
                        <div className={styles.userHeadNavThird}>
                            <span className={styles.userHeadNavLinkRight}><SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" /></span>
                            <span className={styles.userHeadNavLinkRight} onClick={() => router.push(`/user/${router.query.id}/media`)}>Media</span>
                            <span className={styles.userHeadNavLinkRight} onClick={() => router.push(`/user/${router.query.id}/communities`)}>Communities</span>
                        </div>
                    </div>
                    <div className={styles.userHeadProfile} style={{ backgroundImage: userData ? `url(${userData.profileImage.url})` : null }}></div>
                    <div className={styles.userHeadButtons}>
                        {
                            router.query.id === activeUser.accountID ?
                                <>
                                    <div className={styles.userHeadButton} onClick={() => router.push("/settings")}>
                                        <SVGServer.SettingsIcon color="var(--surface)" width="30px" height="30px" />
                                    </div>
                                    <label htmlFor="coverSelector" className={styles.userHeadButton}><SVGServer.ImageIcon color="var(--surface)" width="30px" height="30px" /></label>
                                    <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                                    <label htmlFor="profileSelector" className={styles.userHeadButton}><SVGServer.CameraIcon color="var(--surface)" width="30px" height="30px" /></label>
                                    <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                                </> :
                                <>
                                    <div className={styles.userHeadButton} onClick={() => handleFollowButtonClick()}>
                                        {
                                            userData && userData.userHearted ?
                                                <SVGServer.HeartFilledIcon color="var(--surface)" width="30px" height="30px" /> :
                                                <SVGServer.HeartLineIcon color="var(--surface)" width="30px" height="30px" />
                                        }
                                    </div>
                                </>
                        }
                    </div>
                </div>

                <div className={styles.userFriends}>
                    <div className={styles.userTimelineFeedHead}>
                        <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : userData ? `${userData.firstName}'s ` : ""}Friends</span>
                    </div>
                    {
                        userFriends.length ?
                        <QuadMasonryLayout>
                            {
                                userFriends.map((friend) => 
                                    <UserThumb data={friend} page={pageControl} />
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