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
import CommunityHead from '../../../components/community-head';

export default function CommunityMedia() {
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
        communityNodes: communityData.nodes,
        communityNode: communityData.node
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
        <CommunityHead data={communityData} page={pageControl} title="media" />

      </div>

      <Modals page={pageControl} />
    </div>
  )
}