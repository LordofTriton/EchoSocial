import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './community.module.css';

import CookieService from '../../../services/CookieService'
import Echo from "../../components/echo";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import Modals from '../../components/modals';
import useModalStates from '../../hooks/useModalStates';
import { useSocketContext } from '../../../util/SocketProvider';
import DateGenerator from '../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../components/masonry/duo-masonry';
import CommunityHead from '../../components/community-head';
import useDataStates from '../../hooks/useDataStates';
import CacheService from '../../../services/CacheService';

export default function Community() {
  const router = useRouter()
  const {modalStates, modalControl} = useModalStates()
  const {dataStates, dataControl} = useDataStates()
  const {socket, socketMethods} = useSocketContext()
  const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [communityData, setCommunityData] = useState(dataStates.communityData(router.query.id) || null)
  const [alert, setAlert] = useState(null)
  const [communityEchoes, setCommunityEchoes] = useState(dataStates.communityFeed(router.query.id) || [])
  const [communityMediaEchoes, setCommunityMediaEchoes] = useState([])
  const [communityMembers, setCommunityMembers] = useState([])
  const [feedPage, setFeedPage] = useState(1)
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
        dataControl.setCommunityData(data.data)
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
        if (feedPage === 1) {
            setCommunityEchoes(data.data)
            if (feedPage < 3) dataControl.setCommunityFeed(router.query.id, data.data)
        }
        else {
          setCommunityEchoes((state) => state.concat(data.data))
            if (feedPage < 3) dataControl.setCommunityFeed(router.query.id, communityEchoes.concat(data.data))
        }
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
        communityNodes: communityData.nodes,
        communityNode: communityData.node
    } : null,
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
    createAlert,
    ...modalStates,
    ...modalControl,
    ...dataStates,
    ...dataControl
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
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <CommunityHead data={communityData} page={pageControl} title="timeline" />

        <div className={styles.communityTimeline}>
          <div className={styles.communityTimelineData}>
            <div className={styles.communityTimelineDataBlock}>
              <span className={styles.communityTimelineDataTitle}>About</span>
              <span className={styles.communityTimelineDataIntro}>{communityData?.description ? communityData.description : `Loading description...`}</span>

              <div className={styles.communityTimelineDataBox}>
                <span className={styles.communityTimelineDataBoxIcon}><SVGServer.PeopleIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.communityTimelineDataBoxDataText}>{communityData?.memberCount ? communityData.memberCount : 0}</span>
              </div>
              <div className={styles.communityTimelineDataBox}>
                <span className={styles.communityTimelineDataBoxIcon}><SVGServer.CalendarIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.communityTimelineDataBoxDataText}>{communityData?.dateCreated ? `Created ${DateGenerator.GenerateDateTime(communityData.dateCreated)}` : "None."}</span>
              </div>
              <br />
            </div>

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