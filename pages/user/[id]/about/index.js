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
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import AppConfig from '../../../../util/config';
import UserHead from '../../../components/user-head';
import useDataStates from '../../../hooks/useDataStates';

export default function UserAbout() {
    const router = useRouter()
    const {modalStates, modalControl} = useModalStates()
    
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userData, setUserData] = useState(null)
    const [alert, setAlert] = useState(null)

    useEffect(() => {
        const updateUserData = (data) => {
            if (data.success) {
                setUserData(data.data)
            }
        }
        if (router.query.id) {
            APIClient.get(APIClient.routes.getAccount, {
                accountID: activeUser.accountID,
                userID: router.query.id
            }, updateUserData)
        }
    }, [router.query])

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

    return (
        <div className="page" style={{ backgroundColor: "var(--base)" }}>
            <Head>
                <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
                <UserHead data={userData} page={pageControl} title="about" />

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
                            userData && userData.nodes.length > 1 ?
                            userData.nodes.map((node, index) => 
                                <span key={index} className={styles.userAboutNode}>{node.emoji} {node.displayName}</span>
                            ) : <span style={{color: "var(--primary)", display: "block", padding: "20px"}}>{activeUser.accountID === userData.accountID ? "You have" : "This user has"} no nodes.</span>
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
                                <span className={styles.userAboutSocialLink}>{`/user/${userData.accountID}`}</span>
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