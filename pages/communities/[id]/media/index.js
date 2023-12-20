import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../community.module.css';

import CacheService from '../../../../services/CacheService'
import Echo from "../../../components/echo";
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSSEContext } from '../../../../util/SocketProvider';
import DateGenerator from '../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../components/masonry/duo-masonry';
import CommunityHead from '../../../components/community-head';
import TriMasonryLayout from '../../../components/masonry/tri-masonry';
import Helpers from '../../../../util/Helpers';
import useDataStates from '../../../hooks/useDataStates';

function VideoMedia({ source, callback }) {
  const handleClick = () => {
    const el = document.getElementById(`VideoMedia_${source}`)
    if (el) el.pause()
  }
  useEffect(() => { setTimeout(() => handleClick(), 15000) }, [])
  return ( <video className={styles.communityMediaVideo} src={source} id={`VideoMedia_${source}`} onClick={() => callback()} autoPlay muted /> )
}

export default function CommunityMedia() {
  const router = useRouter()
  const {modalStates, modalControl} = useModalStates()
  const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [communityData, setCommunityData] = useState(null)
  const [alert, setAlert] = useState(null)
  const [communityMediaEchoes, setCommunityMediaEchoes] = useState([])
  const [echoPage, setEchoPage] = useState(1)
  const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
  })
  const [echoLoader, setEchoLoader] = useState(true)

  useEffect(() => {
    const updateCommunityData = (data) => {
      if (data.success) setCommunityData(data.data)
    }
    if (router.query.id) {
      APIClient.get(APIClient.routes.getCommunity, {
        accountID: activeUser.accountID,
        communityID: router.query.id
      }, updateCommunityData)
    }
  }, [router.query])

  useEffect(() => {
    const updateCommunityMediaEchoes = (data) => {
        if (data.success) {
            Helpers.setPaginatedState(data.data, setCommunityMediaEchoes, data.pagination, "echoID")
            setPagination(data.pagination)
        }
        setEchoLoader(false)
    }
    if (communityData) {
        APIClient.get(APIClient.routes.getCommunityFeed, {
            accountID: activeUser.accountID,
            communityID: router.query.id,
            hasMedia: true,
            page: echoPage,
            pageSize: 7
        }, updateCommunityMediaEchoes)
    }
}, [communityData, echoPage])

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
    <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/newLogoIcon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <CommunityHead data={communityData} page={pageControl} title="media" />

        <div className={styles.communityTimeline}>
          <div className={styles.communityTimelineFeedHead}>
          <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Photos & Videos</span>
          </div>
          {
            communityMediaEchoes.length > 0 ?
            <TriMasonryLayout blocks={
                communityMediaEchoes.length > 0 ?
                communityMediaEchoes.map((echo) => 
                    echo.content.media.map((media, index) => 
                    <>
                    { Helpers.getFileType(media.url) === "image" ? <div className={styles.communityMediaItem}><img className={styles.communityMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} alt="media" /></div> : null }
                    { Helpers.getFileType(media.url) === "video" ? 
                        <div className={styles.communityMediaItem}>
                        <VideoMedia source={media.url} callback={() => modalControl.setShowEchoViewer(echo)} />
                        <div className={styles.communityMediaVideoOverlay}>
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
            :
            !echoLoader ?
                communityData && !communityData.userMember ?
                <span className={styles.communityNull}>Nothing to show - Only members can see media.</span>
                : 
                <span className={styles.communityNull}>Nothing to show - This community has no media.</span>
                : null
          }
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}