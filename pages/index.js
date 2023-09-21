import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import CookieService from '../services/CookieService'
import CacheService from '../services/CacheService'
import styles from '../styles/index.module.css'
import APIClient from '../services/APIClient';
import Echo from './components/echo';
import Modals from './components/modals';
import DuoMasonryLayout from './components/masonry/duo-masonry'
import useModalStates from './hooks/useModalStates'
import useDataStates from './hooks/useDataStates'
import { useSocketContext } from '../util/SocketProvider'

export default function Home() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(CookieService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [alert, setAlert] = useState(null)
  const {modalStates, modalControl} = useModalStates()
  const {dataStates, dataControl} = useDataStates()
  const [echoFeed, setEchoFeed] = useState(dataStates.feed || [])
  const [echoFeedPage, setEchoFeedPage] = useState(1)
  const [echoFeedFilter, setEchoFeedFilter] = useState(null)
  const {socket, socketMethods} = useSocketContext()
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  })
  const [feedLoader, setFeedLoader] = useState(true)

  useEffect(() => {
    if (socket) {
      const updateFeed = (data) => {
        if (data.success) {
          if (echoFeedPage === 1) {
              setEchoFeed(data.data)
              if (echoFeedPage < 2) dataControl.setFeed(data.data)
          }
          else {
              setEchoFeed((state) => state.concat(data.data))
              if (echoFeedPage < 2) dataControl.setFeed(echoFeed.concat(data.data))
          }
          setPagination(data.pagination)
        }
        setFeedLoader(false)
      }
      socketMethods.socketRequest("FEED", {
          accountID: activeUser.accountID,
          page: echoFeedPage,
          pageSize: 10
        },
        updateFeed
      )
    }
  }, [echoFeedPage, socket])

  useEffect(() => {
    setFeedLoader(true)
    if (socket) {
      const updateFeed = (data) => {
        if (data.success) {
          setEchoFeed(data.data)
          setPagination(data.pagination)
        }
        setFeedLoader(false)
      }
      socketMethods.socketRequest("FEED", {
          accountID: activeUser.accountID,
          page: 1,
          pageSize: 10
        },
        updateFeed
      )
    }
  }, [echoFeedFilter])

  const createAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const pageControl = {
    title: "Feed",
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
    ...dataControl,
  }

  const filteredFeed = () => {
    return echoFeed.filter((echo) => echoFeedFilter === null ? true : echo.nodes.includes(echoFeedFilter))
  }

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom && echoFeedPage < pagination.totalPages && !feedLoader) {
      setEchoFeedPage(echoFeedPage + 1);
      setFeedLoader(true)
    }
  };

  return (
    <div className="page" style={{backgroundColor: "var(--base)"}} onScroll={handleScroll}>
      <Head>
        <title>Echo - Home</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      {
        activeUser ?
        <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
          <div className={styles.feedFiltersBox}>
            <span className={styles.feedFilters}>
              <span className={styles.feedFilter} onClick={() => setEchoFeedFilter(null)} style={{backgroundColor: !echoFeedFilter ? "#F58A2Aff" : null, color: !echoFeedFilter ? "white" : null}}>All</span> 
              {
                activeUser && activeUser.nodes.length > 0 ?
                activeUser.nodes.map((node, index) => 
                  <span key={index} className={styles.feedFilter} onClick={() => setEchoFeedFilter(node.nodeID)} style={{backgroundColor: echoFeedFilter === node.nodeID ? "#F58A2Aff" : null, color: echoFeedFilter === node.nodeID ? "white" : null}}>{node.emoji} {node.displayName}</span> 
                )
                : null
              }
            </span>
          </div>
          {
            activeUser ? 
            <DuoMasonryLayout>
            {
              filteredFeed().length ? 
              filteredFeed().map((echo, index) => <Echo data={echo} page={pageControl} key={index} /> ) : null
            }
            </DuoMasonryLayout> : null
          }

          { feedLoader ? 
            <div className="loader" style={{
              width: "70px",
              height: "70px",
              borderWidth: "7px",
              borderColor: "var(--primary) transparent",
              margin: "100px calc(50% - 35px) 0px calc(50% - 35px)"
            }}></div>  : null
          }
        </div> : null
      }

      <Modals page={pageControl} />
    </div>
  )
}