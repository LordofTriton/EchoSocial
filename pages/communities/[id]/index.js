import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './community.module.css';

import Cache from '../../../services/CacheService'
import Echo from "../../components/echo";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import Modals from '../../components/modals';
import useModalStates from '../../hooks/useModalStates';
import { useSocketContext } from '../../../util/SocketProvider';
import DateGenerator from '../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../components/masonry/duo-masonry';

export default function Community() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
  const [communityData, setCommunityData] = useState(null)
  const [alert, setAlert] = useState(null)
  const [communityEchoes, setCommunityEchoes] = useState([])
  const [communityMediaEchoes, setCommunityMediaEchoes] = useState([])
  const [communityMembers, setCommunityMembers] = useState([])
  const {modalStates, modalControl} = useModalStates()
  const [feedPage, setFeedPage] = useState(1)
  const {socket, socketMethods} = useSocketContext()
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const [echoLoader, setEchoLoader] = useState(true)

  useEffect(() => {
    setCommunityEchoes([])
    setCommunityMediaEchoes([])
    const updateCommunityData = (data) => {
      if (data.success) {
        setCommunityData(data.data)
      }
    }
    const showEcho = (data) => data.success ? modalControl.setShowEchoViewer(data.data) : null
    if (router.query.id) {
      if (socket) socketMethods.socketRequest("GET_COMMUNITY", {
        accountID: activeUser.accountID,
        communityID: router.query.id
      }, updateCommunityData)
    }
    if (router.query.echo) {
      if (socket) socketMethods.socketRequest("GET_ECHO", {
        accountID: activeUser.accountID,
        communityID: router.query.id,
        echoID: router.query.echo
      }, showEcho)
    }
  }, [router.query, socket])

  useEffect(() => {
    const updateCommunityEchoes = (data) => {
      if (data.success) {
          setCommunityEchoes((state) => state.concat(data.data))
          setPagination(data.pagination)
      }
      setEchoLoader(false)
    }
    const updateMediaEchoes = (data) => {
      if (data.success) setCommunityMediaEchoes(data.data);
    }
    const updateCommunityMembers = (data) => data.success ? setCommunityMembers(data.data) : null;
    if (communityData) {
      if (socket) socketMethods.socketRequest("COMMUNITY_FEED", {
        accountID: activeUser.accountID,
        communityID: router.query.id,
        page: feedPage,
        pageSize: 10
      }, updateCommunityEchoes)
      if (communityMembers.length < 1) {
        if (socket) socketMethods.socketRequest("GET_MEMBERS", {
          accountID: activeUser.accountID,
          communityID: router.query.id
        }, updateCommunityMembers)
      }
      if (communityMediaEchoes.length < 1) {
        if (socket) socketMethods.socketRequest("COMMUNITY_FEED", {
          accountID: activeUser.accountID,
          communityID: router.query.id,
          hasMedia: true,
          page: 1,
          pageSize: 7
        }, updateMediaEchoes)
      }
    }
  }, [communityData, socket])

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

    if (isAtBottom && feedPage < pagination.totalPages && !echoLoader) {
      setFeedPage(feedPage + 1);
      setEchoLoader(true)
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
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/members`)}>Members</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/about`)}>About</span>
              <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}`)} style={{color: "var(--accent)"}}>Timeline</span>
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

        <div className={styles.communityTimeline}>
          <div className={styles.communityTimelineData}>
            <div className={styles.communityTimelineDataBlock}>
              <span className={styles.communityTimelineDataTitle}>About</span>
              <span className={styles.communityTimelineDataIntro}>{communityData?.description ? communityData.description : `Loading description...`}</span>

              <div className={styles.communityTimelineDataBox}>
                <span className={styles.communityTimelineDataBoxIcon}><SVGServer.HeartFilledIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.communityTimelineDataBoxDataText}>{communityData?.memberCount ? communityData.memberCount : 0}</span>
              </div>
              <div className={styles.communityTimelineDataBox}>
                <span className={styles.communityTimelineDataBoxIcon}><SVGServer.BirthdayIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.communityTimelineDataBoxDataText}>{communityData?.dateCreated ? `Created ${DateGenerator.GenerateDateTime(communityData.dateCreated)}` : "None."}</span>
              </div>
              <br />
            </div>

            {/* {
              communityData && communityData.communities.length ?
              <div className={styles.communityTimelineDataBlock}>
                <span className={styles.communityTimelineDataTitle}>Communities</span>
                {
                  communityData.communities.slice(0, showAllCommunities ? 1000 : 3).map((community, index) =>
                    <span key={index} className={styles.communityTimelineDataCommunity} onClick={() => router.push(`/communities/${community.communityID}`)}>
                      <div style={{ backgroundImage: `url(${community.profileImage.url})` }}></div>
                      <span>{community.displayName}</span>
                    </span>
                  )
                }
                {communityData && communityData.communities.length > 3 ? <span onClick={() => setShowAllCommunities(!showAllCommunities)} className={styles.communityTimelineDataSeeMore}>{showAllCommunities ? "Hide Communities" : "See More"}</span> : null}
              </div> : null
            } */}

            {
              communityMembers.length ?
              <div className={styles.communityTimelineDataBlock}>
                <span className={styles.communityTimelineDataTitle}>Members</span>
                <div style={{ width: "100%", height: "fit-content", overflow: "hidden", padding: "0px 20px 0px 20px" }}>
                  {
                    communityMembers.map((member, index) =>
                      <div key={index} className={styles.communityTimelineDataFriend} style={{ backgroundImage: `url(${member.profileImage.url})` }} onClick={() => router.push(`/user/${member.accountID}`)}></div>
                    )
                  }
                </div>
              </div> : null
            }

            {
              communityMediaEchoes.length > 0 ?
              <div className={styles.communityTimelineDataBlock}>
                <span className={styles.communityTimelineDataTitle}>Photos & Videos</span>
                <div className={styles.communityTimelineDataMedia}>
                  {
                    communityMediaEchoes.map((echo, index) =>
                      echo.content.media.map((media, index) => <div key={index} style={{ backgroundImage: `url(${media.url})` }} onClick={() => modalControl.setShowEchoViewer(echo)} />
                    ))
                  }
                </div>
              </div> : null
            }

          </div>
          <div className={styles.communityTimelineFeed}>
            <div className={styles.communityTimelineFeedHead}>
              <span className={styles.communityTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : ""}Echoes</span>
            </div>
            {
              communityEchoes.length > 0 ?
                <DuoMasonryLayout>
                  {communityEchoes.map((echo, index) => <Echo data={echo} page={pageControl} key={index} />)}
                </DuoMasonryLayout> : null
            }
            { echoLoader ? 
              <div className="loader" style={{
                width: "50px",
                height: "50px",
                borderWidth: "5px",
                borderColor: "var(--primary) transparent",
                margin: "100px calc(50% - 25px) 0px calc(50% - 25px)"
              }}></div>  : null
            }
          </div>
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}