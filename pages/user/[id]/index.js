import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from './user.module.css';

import Cache from '../../../services/CacheService'
import Echo from "../../components/echo";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import Modals from '../../components/modals';
import DuoMasonryLayout from '../../components/masonry/duo-masonry';
import useModalStates from '../../hooks/useModalStates';
import { useSocketContext } from '../../../util/SocketProvider';

export default function User() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
  const [userData, setUserData] = useState(null)
  const [alert, setAlert] = useState(null)
  const [userEchoes, setUserEchoes] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [userMediaEchoes, setUserMediaEchoes] = useState([])
  const {modalStates, modalControl} = useModalStates()
  const [showAllCommunities, setShowAllCommunities] = useState(false)
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
    setUserEchoes([])
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
    const updateEchoes = (data) => {
      if (data.success) {
        setUserEchoes((state) => state.concat(data.data))
        setPagination(data.pagination)
      }
      setEchoLoader(false)
    }
    const updateMediaEchoes = (data) => data.success ? setUserMediaEchoes(data.data) : null;
    const updateUserFriends = (data) => data.success ? setUserFriends(data.data) : null;
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
          userID: router.query.id
        }, updateUserFriends)
      }
      if (userMediaEchoes.length < 1) {
        if (socket) socketMethods.socketRequest("USER_FEED", {
          accountID: userData.accountID,
          userID: router.query.id,
          hasMedia: true,
          page: 1,
          pageSize: 7
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
    if (userData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${userData.profileCover.publicID}`);
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
    if (userData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${userData.profileImage.publicID}`);
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
    if (userData.userHearted) setUserData({...userData, userHearted: false, hearts: userData.hearts - 1})
    else setUserData({...userData, userHearted: true, hearts: userData.hearts + 1})

    if (activeUser.accountID !== userData.accountID) socketMethods.socketEmitter(userData.userHearted ? "DELETE_HEART" : "CREATE_HEART", {
      accountID: activeUser.accountID,
      userID: userData.accountID
    })
  }

  const blockUser = async () => {
    if (socket & activeUser.accountID !== userData.accountID) {
      const blockedUser = (data) => {
        createAlert(data.success ? "success" : "error", data.success ? "User blocked successfully." : data.message)
      }
      socketMethods.socketRequest("CREATE_BLACKLIST", {
        accountID: activeUser.accountID,
        blocker: activeUser.accountID,
        blockee: userData.accountID
      }, blockedUser)
    }
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeUser.dark ? 'classic-dark.css' : 'classic-light.css'}`} />
        <meta name="viewport" content="width=1024"></meta>
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <div className={styles.userHead}>
          <div className={styles.userHeadCover} style={{ backgroundImage: userData ? `url(${userData.profileCover.url})` : null }}></div>
          <div className={styles.userHeadNav}>
            <div className={styles.userHeadNavThird}>
              <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}`)} style={{color: "var(--accent)"}}>Timeline</span>
              <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/about`)}>About</span>
              <span className={styles.userHeadNavLinkLeft} onClick={() => router.push(`/user/${router.query.id}/friends`)}>Friends</span>
            </div>
            <div className={styles.userHeadNavThird}>
              <span className={styles.userHeadNavName}>{userData ? `${userData.firstName} ${userData.lastName}` : ""}</span>
              <span className={styles.userHeadNavNickName}>{userData ? userData.nickname : ""}</span>
            </div>
            <div className={styles.userHeadNavThird}>
              <div className={styles.userHeadOptions}>
                <span className={styles.userHeadNavLinkRight}>
                  <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                </span>
                <div className={styles.userHeadOptionBox}>
                  { userData && userData.accountID !== activeUser.accountID ? <span className={styles.userHeadOption} onClick={() => blockUser()}>Block {userData ? userData.firstName : "User"}</span> : null }
                  { userData && userData.accountID !== activeUser.accountID ? <span className={styles.userHeadOption}>Report {userData ? userData.firstName : "User"}</span> : null }
                  { userData && userData.accountID === activeUser.accountID ? <span className={styles.userHeadOption} onClick={() => router.push(`/user/${router.query.id}/saved`)}>Saved</span> : null }
                </div>
              </div>
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

        <div className={styles.userTimeline}>
          <div className={styles.userTimelineData}>
            <div className={styles.userTimelineDataBlock}>
              <span className={styles.userTimelineDataTitle}>Bio</span>
              <span className={styles.userTimelineDataIntro}>"{userData?.bio ? userData.bio : `Oops. I haven't written my bio yet!`}"</span>

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
              userData && userData.communities.length ?
              <div className={styles.userTimelineDataBlock}>
                <span className={styles.userTimelineDataTitle}>Communities</span>
                {
                  userData.communities.slice(0, showAllCommunities ? 1000 : 3).map((community, index) =>
                    <span key={index} className={styles.userTimelineDataCommunity} onClick={() => router.push(`/communities/${community.communityID}`)}>
                      <div style={{ backgroundImage: `url(${community.profileImage.url})` }}></div>
                      <span>{community.displayName}</span>
                    </span>
                  )
                }
                {userData && userData.communities.length > 3 ? <span onClick={() => setShowAllCommunities(!showAllCommunities)} className={styles.userTimelineDataSeeMore}>{showAllCommunities ? "Hide Communities" : "See More"}</span> : null}
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
              </div> : null
            }

            {
              userMediaEchoes.length > 0 ?
              <div className={styles.userTimelineDataBlock}>
                <span className={styles.userTimelineDataTitle}>Photos & Videos</span>
                <div className={styles.userTimelineDataMedia}>
                  {
                    userMediaEchoes.map((echo, index) =>
                      echo.content.media.map((media, index) => <div key={index} style={{ backgroundImage: `url(${media.url})` }} onClick={() => modalControl.setShowEchoViewer(echo)} />
                    ))
                  }
                </div>
              </div> : null
            }

          </div>
          <div className={styles.userTimelineFeed}>
            <div className={styles.userTimelineFeedHead}>
              <span className={styles.userTimelineFeedHeadTitle}>{router.query.id === activeUser.accountID ? "Your " : ""}Echoes</span>
            </div>
            {
              userEchoes.length > 0 ?
                <DuoMasonryLayout>
                  {userEchoes.map((echo, index) => <Echo data={echo} page={pageControl} key={index} />)}
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