import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './user.module.css';

import CookieService from '../../../services/CookieService'
import Echo from "../../components/echo";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import Modals from '../../components/modals';
import DuoMasonryLayout from '../../components/masonry/duo-masonry';
import useModalStates from '../../hooks/useModalStates';
import { useSocketContext } from '../../../util/SocketProvider';
import UserHead from '../../components/user-head';
import useDataStates from '../../hooks/useDataStates';
import CacheService from '../../../services/CacheService';
import Helpers from '../../../util/Helpers';

export default function User() {
  const router = useRouter()
  const {modalStates, modalControl} = useModalStates()
  const {socket, socketMethods} = useSocketContext()
  const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [userData, setUserData] = useState(null)
  const [alert, setAlert] = useState(null)
  const [userEchoes, setUserEchoes] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [userCommunities, setUserCommunities] = useState([])
  const [userMediaEchoes, setUserMediaEchoes] = useState([])
  const [feedPage, setFeedPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const [echoLoader, setEchoLoader] = useState(true)

  useEffect(() => {
    setUserEchoes([])
    setUserMediaEchoes([])
    setUserFriends([])
    setUserCommunities([])
    const updateUserData = (data) => data.success ? setUserData(data.data) : null;
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
    const updateEchoes = (data) => {
      if (data.success) {
        Helpers.setPaginatedState(data.data, setUserEchoes, data.pagination, "echoID")
        setPagination(data.pagination)
        console.log(data.data[0])
      }
      setEchoLoader(false)
    }
    const updateMediaEchoes = (data) => data.success ? setUserMediaEchoes(data.data) : null;
    const updateUserFriends = (data) => data.success ? setUserFriends(data.data) : null;
    const updateUserCommunities = (data) => data.success ? setUserCommunities(data.data) : null;
    if (userData) {
      if (socket) socketMethods.socketRequest("USER_FEED", {
        accountID: activeUser.accountID,
        userID: router.query.id,
        page: feedPage,
        pageSize: 10
      }, updateEchoes)
      if (userFriends.length < 1) {
        if (socket) socketMethods.socketRequest("GET_FRIENDS", {
          accountID: activeUser.accountID,
          userID: router.query.id,
          page: 1,
          pageSize: 10
        }, updateUserFriends)
      }
      if (userCommunities.length < 1) {
        if (socket) socketMethods.socketRequest("GET_COMMUNITIES", {
          accountID: activeUser.accountID,
          userID: router.query.id,
          member: true,
          page: 1,
          pageSize: 10
        }, updateUserCommunities)
      }
      if (userMediaEchoes.length < 1) {
        if (socket) socketMethods.socketRequest("USER_FEED", {
          accountID: userData.accountID,
          userID: router.query.id,
          hasMedia: true,
          page: 1,
          pageSize: 6
        }, updateMediaEchoes)
      }
    }
  }, [userData, feedPage, socket])

  const createAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const pageControl = {
    title: userData ? `${userData.firstName} ${userData.lastName}` : "User",
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
    socket,
    createAlert,
    ...modalStates,
    ...modalControl,
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
        <title>Echo - {userData ? `${userData.firstName} ${userData.lastName}` : "User"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/icon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <UserHead data={userData} page={pageControl} title="timeline" />

        <div className={styles.userTimeline}>
          <div className={styles.userTimelineData}>
            <div className={styles.userTimelineDataBlock}>
              <span className={styles.userTimelineDataTitle}>Bio</span>
              <span className={styles.userTimelineDataIntro}>{userData?.bio ? userData.bio : `Oops. I haven't written my bio yet!`}</span>

              <div className={styles.userTimelineDataBox}>
                <span className={styles.userTimelineDataBoxIcon}><SVGServer.HeartFilledIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.userTimelineDataBoxDataText}>{userData?.hearts ? userData.hearts : 0}</span>
              </div>
              <div className={styles.userTimelineDataBox}>
                <span className={styles.userTimelineDataBoxIcon}><SVGServer.BirthdayIcon color="var(--primary)" width="25px" height="25px" /></span>
                <span className={styles.userTimelineDataBoxDataText}>{userData?.dateOfBirth ? userData.dateOfBirth : "None."}</span>
              </div>
              <br />
            </div>

            {
              userCommunities.length ?
              <div className={styles.userTimelineDataBlock}>
                <span className={styles.userTimelineDataTitle}>Communities</span>
                {
                  userCommunities.map((community, index) =>
                    <span key={index} className={styles.userTimelineDataCommunity} onClick={() => router.push(`/communities/${community.communityID}`)}>
                      <div style={{ backgroundImage: `url(${community.profileImage.url})` }}></div>
                      <span>{community.displayName}</span>
                    </span>
                  )
                }
                <span onClick={() => router.push(`/user/${userData.accountID}/communities`)} className={styles.userTimelineDataSeeMore}>See More</span>
              </div> : null
            }

            {
              userFriends.length ?
              <div className={styles.userTimelineDataBlock}>
                <span className={styles.userTimelineDataTitle}>Friends</span>
                <div style={{ width: "100%", height: "fit-content", overflow: "hidden", padding: "0px 20px 0px 20px" }}>
                  {
                    userFriends.map((friend, index) =>
                      <div key={index} className={styles.userTimelineDataFriend} style={{ backgroundImage: `url(${friend.profileImage.url})` }} onClick={() => router.push(`/user/${friend.accountID}`)}></div>
                    )
                  }
                </div>
                <span onClick={() => router.push(`/user/${userData.accountID}/friends`)} className={styles.userTimelineDataSeeMore}>See More</span>
              </div> : null
            }

            {
              userMediaEchoes.length > 0 ?
              <div className={styles.userTimelineDataBlock}>
                <span className={styles.userTimelineDataTitle}>Photos</span>
                <div className={styles.userTimelineDataMedia}>
                  {
                    userMediaEchoes.map((echo, index) =>
                      echo.content.media.filter((item) => item.type === "image").map((media, index) => <div key={index} style={{ backgroundImage: `url(${media.url})` }} onClick={() => modalControl.setShowEchoViewer(echo)} />
                    ))
                  }
                </div>
                <span onClick={() => router.push(`/user/${userData.accountID}/media`)} className={styles.userTimelineDataSeeMore}>See More</span>
              </div> : null
            }

          </div>
          <div className={styles.userTimelineFeed}>
            <div className={styles.userTimelineFeedHead}>
              <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : ""}Echoes</span>
            </div>
            {
              userEchoes.length > 0 ?
                <DuoMasonryLayout blocks={userEchoes.map((echo, index) => <Echo data={echo} page={pageControl} key={index} />)} />
              : 
                !echoLoader ? <span className={styles.userNull}>Nothing to show - {router.query.id === activeUser.accountID ? 'You have' : 'This user has'} no echoes{router.query.id !== activeUser.accountID ? ' you can see' : ''}.</span> : null
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