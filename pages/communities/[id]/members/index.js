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
import DateGenerator from '../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../components/masonry/duo-masonry';
import QuadMasonryLayout from '../../../components/masonry/quad-masonry';
import UserThumb from '../../../components/user-thumb';
import CommunityHead from '../../../components/community-head';
import useDataStates from '../../../hooks/useDataStates';
import Helpers from '../../../../util/Helpers';
import Loader from '../../../components/loader';

export default function CommunityMembers() {
  const router = useRouter()
  const { modalStates, modalControl } = useModalStates()
  const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
  const [communityData, setCommunityData] = useState(null)
  const [alert, setAlert] = useState(null)
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
    const updateCommunityMembers = (data) => {
      if (data.success) {
        Helpers.setPaginatedState(data.data, setCommunityMembers, data.pagination, "accountID")
        setPagination(data.pagination)
      }
      setMemberLoader(false)
    }
    if (communityData) {
      APIClient.get(APIClient.routes.getCommunityMembers, {
        accountID: activeUser.accountID,
        communityID: router.query.id,
        page: memberPage,
        pageSize: 10
      }, updateCommunityMembers)
    }
  }, [communityData, memberPage])

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

    if (isAtBottom && memberPage < pagination.totalPages && !memberLoader) {
      setMemberPage(memberPage + 1);
      setMemberLoader(true)
    }
  };

  const handleKick = async (accountID) => {
    APIClient.del(APIClient.routes.deleteCommunityMember, {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      userID: accountID
    })
    setCommunityMembers(communityMembers.filter((member) => member.accountID !== accountID))
    createAlert("success", "User kicked successfully.")
  }

  const handleBan = async (accountID) => {
    APIClient.post(APIClient.routes.banCommunityMember, {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      userID: accountID
    })
    setCommunityMembers(communityMembers.filter((member) => member.accountID !== accountID))
    createAlert("success", "User banned successfully.")
  }

  const handleMute = async (accountID) => {
    APIClient.post(APIClient.routes.updateCommunityMember, {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      userID: accountID,
      muted: true
    })
    setCommunityMembers(communityMembers.filter((member) => member.accountID !== accountID))
    createAlert("success", "User muted successfully.")
  }

  const handleAssignRole = async (accountID, role) => {
    APIClient.post(APIClient.routes.updateCommunityMember, {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      userID: accountID,
      role: role
    })
    setCommunityMembers(communityMembers.map((member) => member.accountID !== accountID ? member : { ...member, role }))
    createAlert("success", "User role assigned successfully.")
  }

  return (
    <div className="page" style={{ backgroundColor: "var(--base)" }} onScroll={handleScroll}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/newLogoIcon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
        <CommunityHead data={communityData} page={pageControl} title="members" />

        <div className={styles.communityFriends}>
          <div className={styles.communityTimelineFeedHead}>
            <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Members</span>
          </div>
          {
            communityMembers.length ?
              communityData.userMember.role === "member" ?
                <QuadMasonryLayout blocks={
                  communityMembers.map((member, index) =>
                    <UserThumb data={member} page={pageControl} key={index} />
                  )
                } /> :
                communityMembers.map((member, index) =>
                  <div className={styles.communityMember} key={index}>
                    <div className={styles.communityMemberProfile} style={{ backgroundImage: `url(${member.profileImage.url})` }} onClick={() => router.push(`/user/${member.accountID}`)}></div>
                    <span className={styles.communityMemberName} onClick={() => router.push(`/user/${member.accountID}`)}>{member.firstName} {member.lastName}<br /><span>{member.role}</span></span>
                    {member.role !== "admin" ?
                      <div className={styles.communityMemberOptions}>
                        <SVGServer.OptionIcon color="var(--primary)" width="20px" height="20px" />
                        <div className={styles.communityMemberOptionsDrop}>
                          <span className={styles.communityMemberOption} onClick={() => handleKick(member.accountID)}>Kick</span>
                          <span className={styles.communityMemberOption} onClick={() => handleBan(member.accountID)}>Ban</span>
                          <span className={styles.communityMemberOption} onClick={() => handleMute(member.accountID)}>Mute</span>
                          <span className={styles.communityMemberOption} onClick={() => handleAssignRole(member.accountID, member.role === "member" ? "moderator" : "member")}>{member.role === "member" ? "Set as Moderator" : "Set as Member"}</span>
                        </div>
                      </div>
                      : null
                    }
                  </div>
                )
              : 
              !memberLoader ?
                communityData && !communityData.userMember ?
                <span className={styles.communityNull}>Nothing to show - Only members can see members.</span>
                : 
                <span className={styles.communityNull}>Nothing to show - This community has no members.</span>
                : null
          }
        </div>
        { memberLoader ? <Loader size="50px" thickness="5px" color="var(--primary)" style={{margin: "100px calc(50% - 25px) 0px calc(50% - 25px)"}} /> : null }
      </div>

      <Modals page={pageControl} />
    </div>
  )
}