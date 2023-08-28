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
import AppConfig from '../../../../util/config';

export default function UserAbout() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const {socket, socketMethods} = useSocketContext()

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
                            <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/about`)} style={{ color: "var(--accent)" }}>About</span>
                            <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/friends`)}>Friends</span>
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
                    <div className={styles.userAboutPersonal}>
                        <span className={styles.userTimelineDataTitle}>Personal Data</span>
                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Bio</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.bio : "Oops! I haven't written by bio yet!"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>First Name</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.firstName : "Firstname"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Last Name</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.lastName : "McLastname"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Gender</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.gender : "None"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Occupation</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.occupation : "Astronaut"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Email</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.email : "example@gmail.com"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Birthday</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.dateOfBirth : "03-05-2001"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Phone</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.phone : "08111111111"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Relationship</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.maritalStatus : "None"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>Country</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.country : "Nigeria"}</span>
                        </div>

                        <div className={styles.userAboutPersonalData}>
                            <span className={styles.userAboutPersonalDataName}>City</span>
                            <span className={styles.userAboutPersonalDataValue}>{userData ? userData.city : "Lagos"}</span>
                        </div>
                    </div>
                    <div className={styles.userAboutNodes}>
                        <span className={styles.userTimelineDataTitle}>Nodes</span>
                        <div style={{padding: "0px 20px"}}>
                        {
                            activeUser && activeUser.nodes.length > 1 ?
                            activeUser.nodes.map((node) => 
                                <span className={styles.userAboutNode}>{node.emoji} {node.displayName}</span>
                            ) : null
                        }
                        </div>
                    </div>
                    <div className={styles.userAboutSocials}>
                        <span className={styles.userTimelineDataTitle}>Socials</span>
                        {
                            userData ?
                            <span className={styles.userAboutSocial} style={{backgroundColor: "var(--primary)"}} onClick={() => router.push(`/user/${userData.accountID}`)}>
                                <span className={styles.userAboutSocialIcon}><SVGServer.FeedIcon color="white" width="20px" height="20px" /></span>
                                Echo
                                <span className={styles.userAboutSocialLink}>{`${AppConfig.HOST}/user/${userData.accountID}`}</span>
                            </span> : null
                        }
                        {
                            userData && userData.fSocial ?
                            <span className={styles.userAboutSocial} style={{backgroundColor: "#1877F2"}} onClick={() => router.push(`https://${userData.fSocial}`)}>
                                <span className={styles.userAboutSocialIcon}><SVGServer.FacebookIcon color="white" width="20px" height="20px" /></span>
                                Facebook
                                <span className={styles.userAboutSocialLink}>{userData.fSocial}</span>
                            </span> : null
                        }
                        {
                            userData && userData.iSocial ?
                            <span className={styles.userAboutSocial} style={{backgroundColor: "rgb(224, 35, 54)"}} onClick={() => router.push(`https://${userData.iSocial}`)}>
                                <span className={styles.userAboutSocialIcon}><SVGServer.InstagramIcon color="white" width="20px" height="20px" /></span>
                                Instagram
                                <span className={styles.userAboutSocialLink}>{userData.iSocial}</span>
                            </span> : null
                        }
                        {
                            userData && userData.tSocial ?
                            <span className={styles.userAboutSocial} style={{backgroundColor: "dimgray"}} onClick={() => router.push(`https://${userData.tSocial}`)}>
                                <span className={styles.userAboutSocialIcon}><SVGServer.XIcon color="white" width="20px" height="20px" /></span>
                                X
                                <span className={styles.userAboutSocialLink}>{userData.tSocial}</span>
                            </span> : null
                        }
                    </div>
                </div>
            </div>

            <Modals page={pageControl} />
        </div>
    )
}