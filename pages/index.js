import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import CacheService from '../services/CacheService'
import styles from '../styles/index.module.css'
import APIClient from '../services/APIClient';
import Echo from './components/echo';
import Modals from './components/modals';
import DuoMasonryLayout from './components/masonry/duo-masonry'
import useModalStates from './hooks/useModalStates'
import { useSSEContext } from '../util/SocketProvider'
import Helpers from '../util/Helpers'
import SVGServer from '../services/svg/svgServer'

export default function Home() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [alert, setAlert] = useState(null)
  const {modalStates, modalControl} = useModalStates()
  const [echoFeed, setEchoFeed] = useState([])
  const [echoFeedPage, setEchoFeedPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const [feedLoader, setFeedLoader] = useState(true)
  const [pagePremier, setPagePremier] = useState(null)

  useEffect(() => {
    const updateFeed = (data) => {
      if (data.success) {
        Helpers.setPaginatedState(data.data, setEchoFeed, data.pagination, "echoID")
        setPagination(data.pagination)
      }
      setFeedLoader(false)
    }
    APIClient.get(APIClient.routes.getFeed, {
      accountID: activeUser.accountID,
      page: echoFeedPage,
      pageSize: 10
    }, updateFeed)
  }, [echoFeedPage])

  const createAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const pageControl = {
    title: "Feed",
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

    if (isAtBottom) switchPage()
    else {
      let premierIsAboveTop = false;
      const premier = document.getElementById(pagePremier);
      if (premier) {
        const rect = premier.getBoundingClientRect();
        premierIsAboveTop = rect.bottom < 0;
      }

      if (premierIsAboveTop) switchPage();
    }
  };

  const switchPage = () => {
    if (feedLoader) return;
    if (echoFeedPage < pagination.totalPages) {
      setEchoFeedPage(echoFeedPage + 1);
      setFeedLoader(true)
    }
  }

  return (
    <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
      <Head>
        <title>Echo - Home</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/newLogoIcon.ico" />
        <meta name="description" content="Echo is a simple, basic social media platform designed to bring together people with similar interests and passions." />
        <meta name="keywords" content="Echo, Echo Social, Social Media" />
        <meta name="author" content="Joshua Agboola" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      {
        activeUser ?
          <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
          
            {/* <div className={styles.feedFiltersBox}>
              <span className={styles.feedFilters}>
                <span className={styles.feedFilter} onClick={() => setEchoFeedFilter(null)} style={{ backgroundColor: !echoFeedFilter ? "#F58A2Aff" : null, color: !echoFeedFilter ? "white" : null }}>All</span>
                {
                  activeUser && activeUser.nodes.length > 0 ?
                    activeUser.nodes.map((node, index) =>
                      <span key={index} className={styles.feedFilter} onClick={() => setEchoFeedFilter(node.nodeID)} style={{ backgroundColor: echoFeedFilter === node.nodeID ? "#F58A2Aff" : null, color: echoFeedFilter === node.nodeID ? "white" : null }}>{node.emoji} {node.displayName}</span>
                    )
                    : null
                }
              </span>
            </div> */}

            <div className={styles.feedHead} onClick={() => modalControl.setShowEchoCreator(true)}>
              <span className={styles.feedHeadText}>echo</span>
              <div className={styles.feedHeadCreator}>
                <div className={styles.feedHeadCreatorProfile} style={{backgroundImage: `url(${activeUser.profileImage.url})`}}></div>
                <span className={styles.feedHeadCreatorInput}>{`What's on your mind?`}</span>
                <span className={styles.feedHeadCreatorImage}>
                  <SVGServer.SendIcon color="var(--alt)" width="40px" height="40px" />
                </span>
              </div>
            </div>

            { echoFeed.length ? <DuoMasonryLayout blocks={echoFeed.map((echo, index) => <Echo data={echo} page={pageControl} key={index} /> )} /> : null }

            {feedLoader ?
              <div className="loader" style={{
                width: "70px",
                height: "70px",
                borderWidth: "7px",
                borderColor: "var(--primary) transparent",
                margin: "100px calc(50% - 35px) 0px calc(50% - 35px)"
              }}></div> : null
            }
          </div> : null
      }

      <Modals page={pageControl} />
    </div>
  )
}