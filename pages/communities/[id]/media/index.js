import Head from 'next/head'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from '../community.module.css';

import CookieService from '../../../../services/CookieService'
import Echo from "../../../components/echo";
import APIClient from "../../../../services/APIClient";
import SVGServer from "../../../../services/svg/svgServer";
import Modals from '../../../components/modals';
import useModalStates from '../../../hooks/useModalStates';
import { useSocketContext } from '../../../../util/SocketProvider';
import DateGenerator from '../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../components/masonry/duo-masonry';
import CommunityHead from '../../../components/community-head';
import TriMasonryLayout from '../../../components/masonry/tri-masonry';
import Helpers from '../../../../util/Helpers';
import useDataStates from '../../../hooks/useDataStates';
import CacheService from '../../../../services/CacheService';

export default function CommunityMedia() {
  const router = useRouter()
  const {modalStates, modalControl} = useModalStates()
  const {dataStates, dataControl} = useDataStates()
  const {socket, socketMethods} = useSocketContext()
  const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [communityData, setCommunityData] = useState(dataStates.communityData(router.query.id) || null)
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
    const updateCommunityMediaEchoes = (data) => {
        if (data.success) {
            setCommunityMediaEchoes((state) => state.concat(data.data))
            setPagination(data.pagination)
        }
        setEchoLoader(false)
    }
    if (communityData) {
        if (socket) socketMethods.socketRequest("COMMUNITY_FEED", {
            accountID: activeUser.accountID,
            communityID: router.query.id,
            hasMedia: true,
            page: echoPage,
            pageSize: 7
        }, updateCommunityMediaEchoes)
    }
}, [communityData, echoPage, socket])

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
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
        <CommunityHead data={communityData} page={pageControl} title="media" />

        <div className={styles.communityTimeline}>
          <div className={styles.communityTimelineFeedHead}>
          <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Photos & Videos</span>
          </div>
          <TriMasonryLayout>
          {
              communityMediaEchoes.length > 0 ?
              communityMediaEchoes.map((echo) => 
                  echo.content.media.map((media, index) => 
                      <>
                      { Helpers.getFileType(media.url) === "image" ? <img className={styles.communityMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} alt="media" /> : null }
                      { Helpers.getFileType(media.url) === "video" ? <video className={styles.communityMediaImage} src={media.url} onClick={() => modalControl.setShowEchoViewer(echo)} /> : null }
                      </>
                  )
              ) : null
          }
          </TriMasonryLayout>
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}