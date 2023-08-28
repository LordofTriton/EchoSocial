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
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';

export default function CommunityMembers() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
  const [communityData, setCommunityData] = useState(null)
  const [alert, setAlert] = useState(null)
  const {modalStates, modalControl} = useModalStates()
  const {socket, socketMethods} = useSocketContext()
  const [communityMembers, setCommunityMembers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const [memberLoader, setMemberLoader] = useState(true)
  const [memberPage, setMemberPage] = useState(1)

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

  useEffect(() => {
    const updateCommunityMembers = (data) => {
        if (data.success) {
            setCommunityMembers(data.data);
            setPagination(data.pagination)
        }
        setMemberLoader(false)
    }
    if (communityData) {
      if (communityMembers.length < 1) {
        if (socket) socketMethods.socketRequest("GET_MEMBERS", {
          accountID: activeUser.accountID,
          communityID: router.query.id
        }, updateCommunityMembers)
      }
    }
  }, [communityData, memberPage, socket])

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

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom && memberPage < pagination.totalPages && !memberLoader) {
      setMemberPage(memberPage + 1);
      setMemberLoader(true)
    }
  };

  return (
    <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeUser.dark ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <div className={styles.communityHead}>
          <div className={styles.communityHeadCover} style={{backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null}}></div>
          <div className={styles.communityHeadNav}>
              <span className={styles.communityHeadNavName}>{communityData ? communityData.displayName : ""}</span>
              <span className={styles.communityHeadNavLink}><SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" /></span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/media`)}>Media</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/members`)} style={{color: "var(--accent)"}}>Members</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/about`)}>About</span>
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
            <div className={styles.communityTimelineFeedHead}>
                <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Members</span>
            </div>
            {
                communityMembers.length ?
                    communityData.userMember.role === "member" ?
                    <QuadMasonryLayout>
                        {
                            communityMembers.map((friend, index) => 
                                <UserThumb data={friend} page={pageControl} key={index} />
                            )
                        }
                    </QuadMasonryLayout> : 
                    communityMembers.map((member, index) => 
                        <div className={styles.communityMember} key={index}>
                            <div className={styles.communityMemberProfile} style={{backgroundImage: `url(${member.profileImage.url})`}}></div>
                            <span className={styles.communityMemberName}>{member.firstName} {member.lastName}<br /><span>{member.role}</span></span>
                            <div className={styles.communityMemberOptions}>
                                <SVGServer.OptionIcon color="var(--primary)" width="20px" height="20px" />
                                <div className={styles.communityMemberOptionsDrop}>
                                    <span className={styles.communityMemberOption}>Kick</span>
                                    <span className={styles.communityMemberOption}>Ban</span>
                                    <span className={styles.communityMemberOption}>Mute</span>
                                    <span className={styles.communityMemberOption}>Change Role</span>
                                </div>
                            </div>
                        </div>
                    )
                : null
            }
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}