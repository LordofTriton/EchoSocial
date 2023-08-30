import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../community.module.css';

import Cache from '../../../../services/CacheService'
import Echo from "../../../components/echo";
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSocketContext } from '../../../../util/SocketProvider';
import DateGenerator from '../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../components/masonry/duo-masonry';
import AppConfig from '../../../../util/config';

export default function CommunityAbout() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
  const [communityData, setCommunityData] = useState(null)
  const [alert, setAlert] = useState(null)
  const {modalStates, modalControl} = useModalStates()
  const {socket, socketMethods} = useSocketContext()

  useEffect(() => {
    const updateCommunityData = (data) => {
      if (data.success) {
        setCommunityData(data.data)
      }
    }
    if (router.query.id) {
      if (socket) socketMethods.socketRequest("GET_COMMUNITY", {
        accountID: activeUser.accountID,
        communityID: router.query.id
      }, updateCommunityData)
    }
  }, [router.query, socket])

  const createAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const pageControl = {
    title: communityData ? `${communityData.displayName}` : "Community",
    community: communityData ? {
        communityID: communityData.communityID,
        communityName: communityData.displayName,
        communityNodes: communityData.nodes
    } : null,
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

  const handleUpdateProfileCover = async (e) => {
    const formData = new FormData();
    formData.append(`media`, e.target.files[0])
    const uploadedFile = (await APIClient.post("/cloud/upload", formData, {'Content-Type': "multipart/form-data"})).data;
    if (!uploadedFile.success) {
      createAlert({type: "error", message: uploadedFile.message})
      return;
    }
    if (communityData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileCover.publicID}`);
    setCommunityData({...communityData, profileCover: uploadedFile.data[0]})

    if (socket) socketMethods.socketEmitter("UPDATE_COMMUNITY", { 
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      profileCover: uploadedFile.data[0]
    })
  }

  const handleUpdateProfileImage = async (e) => {
    const formData = new FormData();
    formData.append(`media`, e.target.files[0])
    const uploadedFile = (await APIClient.post("/cloud/upload", formData, {'Content-Type': "multipart/form-data"})).data;
    if (!uploadedFile.success) {
      createAlert({type: "error", message: uploadedFile.message})
      return;
    }
    if (communityData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileImage.publicID}`);
    setCommunityData({...communityData, profileImage: uploadedFile.data[0]})

    if (socket) socketMethods.socketEmitter("UPDATE_COMMUNITY", { 
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      profileImage: uploadedFile.data[0]
    })
  }

  const handleLeaveGroup = async () => {

  }

  return (
    <div className="page" style={{backgroundColor: "var(--base)"}}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <div className={styles.communityHead}>
          <div className={styles.communityHeadCover} style={{backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null}}></div>
          <div className={styles.communityHeadNav}>
              <span className={styles.communityHeadNavName}>{communityData ? communityData.displayName : ""}</span>
              <span className={styles.communityHeadNavLink}><SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" /></span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/media`)}>Media</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/members`)}>Members</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/about`)} style={{color: "var(--accent)"}}>About</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}`)}>Timeline</span>
          </div>
          <div className={styles.communityHeadProfile} style={{backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null}}></div>
          <div className={styles.communityHeadButtons}>
            {
              communityData && communityData.userMember && communityData.userMember.role !== "member" ?
              <>
                <div className={styles.communityHeadButton} onClick={() => router.push("/settings")}>
                  <SVGServer.SettingsIcon color="var(--surface)" width="30px" height="30px" />
                </div>
    
                <label htmlFor="coverSelector" className={styles.communityHeadButton}><SVGServer.ImageIcon color="var(--surface)" width="30px" height="30px" /></label>
                <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{display: "none"}} multiple/>
    
                <label htmlFor="profileSelector" className={styles.communityHeadButton}><SVGServer.CameraIcon color="var(--surface)" width="30px" height="30px" /></label>
                <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{display: "none"}} multiple/>
              </> :
              <div className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                <SVGServer.LogoutIcon color="var(--surface)" width="30px" height="30px" />
              </div>
            }
          </div>
        </div>

        <div className={styles.communityFriends}>
            <div className={styles.communityAboutPersonal}>
                <span className={styles.communityTimelineDataTitle}>Personal Data</span>
                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Description</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? communityData.description : "Loading description..."}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Name</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? communityData.displayName : "Community"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Privacy</span>
                    <span className={styles.communityAboutPersonalDataValue} style={{textTransform: "capitalize"}}>{communityData ? communityData.privacy : "Public"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Country</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? communityData.country : "None"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>City</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? communityData.city : "None"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Website</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? communityData.website : "None"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Date Created</span>
                    <span className={styles.communityAboutPersonalDataValue}>{communityData ? DateGenerator.GenerateDateTime(communityData.dateCreated) : "03-05-2001"}</span>
                </div>

                <div className={styles.communityAboutPersonalData}>
                    <span className={styles.communityAboutPersonalDataName}>Status</span>
                    <span className={styles.communityAboutPersonalDataValue} style={{textTransform: "capitalize"}}>{communityData ? communityData.communityStatus : "Active"}</span>
                </div>
            </div>
            <div className={styles.communityAboutNodes}>
                <span className={styles.communityTimelineDataTitle}>Nodes</span>
                <div style={{padding: "0px 20px"}}>
                {
                    communityData && communityData.nodes.length > 0 ?
                    communityData.nodes.map((node, index) => 
                        <span key={index} className={styles.communityAboutNode}>{node.emoji} {node.displayName}</span>
                    ) : null
                }
                </div>
            </div>
            <div className={styles.communityAboutSocials}>
                <span className={styles.communityTimelineDataTitle}>Socials</span>
                {
                    communityData ?
                    <span className={styles.communityAboutSocial} style={{backgroundColor: "var(--primary)"}} onClick={() => router.push(`/communities/${communityData.communityID}`)}>
                        <span className={styles.communityAboutSocialIcon}><SVGServer.FeedIcon color="white" width="20px" height="20px" /></span>
                        Echo
                        <span className={styles.communityAboutSocialLink}>{`${AppConfig.HOST}/community/${communityData.communityID}`}</span>
                    </span> : null
                }
                {
                    communityData && communityData.fSocial ?
                    <span className={styles.communityAboutSocial} style={{backgroundColor: "#1877F2"}} onClick={() => router.push(`https://${communityData.fSocial}`)}>
                        <span className={styles.communityAboutSocialIcon}><SVGServer.FacebookIcon color="white" width="20px" height="20px" /></span>
                        Facebook
                        <span className={styles.communityAboutSocialLink}>{communityData.fSocial}</span>
                    </span> : null
                }
                {
                    communityData && communityData.iSocial ?
                    <span className={styles.communityAboutSocial} style={{backgroundColor: "rgb(224, 35, 54)"}} onClick={() => router.push(`https://${communityData.iSocial}`)}>
                        <span className={styles.communityAboutSocialIcon}><SVGServer.InstagramIcon color="white" width="20px" height="20px" /></span>
                        Instagram
                        <span className={styles.communityAboutSocialLink}>{communityData.iSocial}</span>
                    </span> : null
                }
                {
                    communityData && communityData.tSocial ?
                    <span className={styles.communityAboutSocial} style={{backgroundColor: "dimgray"}} onClick={() => router.push(`https://${communityData.tSocial}`)}>
                        <span className={styles.communityAboutSocialIcon}><SVGServer.XIcon color="white" width="20px" height="20px" /></span>
                        X
                        <span className={styles.communityAboutSocialLink}>{communityData.tSocial}</span>
                    </span> : null
                }
            </div>
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}