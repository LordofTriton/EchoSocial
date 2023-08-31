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
import { Form } from '../../../components/form';
import CommunityHead from '../../../components/community-head';

export default function CommunitySettings() {
  const router = useRouter()
  const [activeUser, setActiveUser] = useState(Cache.getData("EchoUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "light")
  const [communityData, setCommunityData] = useState(null)
  const [updatedCommunityData, setUpdatedCommunityData] = useState({
    communityID: "",
    name: "",
    displayName: "",
    description: "",
    nodes: [],
    privacy: "",
    entryApproval: false,
    echoApproval: false,
    country: "",
    city: "",
    website: "",
    fSocial: "",
    tSocial: "",
    iSocial: ""
  })
  const [communityApplications, setCommunityApplications] = useState([])
  const [alert, setAlert] = useState(null)
  const { modalStates, modalControl } = useModalStates()
  const { socket, socketMethods } = useSocketContext()
  const [settingsPage, setSettingsPage] = useState("general")

  useEffect(() => {
    const updateCommunityData = (data) => {
      if (data.success) {
        setCommunityData(data.data)
        setUpdatedCommunityData({ ...updateCommunityData, ...data.data })
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
      communityNodes: communityData.nodes
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

  const handleSubmitGeneral = async () => {
    if (!socket) return;
    socketMethods.socketEmitter("UPDATE_COMMUNITY", {
      accountID: activeUser.accountID,
      ...updatedCommunityData
    })
    createAlert("success", "Updated community succesfully.")
  }

  return (
    <div className="page" style={{ backgroundColor: "var(--base)" }}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
      </Head>

      <div className="pageContent" style={{ backgroundColor: "var(--base)" }}>
        <CommunityHead data={communityData} page={pageControl} />

        <div className={styles.communityFriends}>
          <div className={styles.communityTimelineFeedHead}>
            <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Settings</span>
          </div>
          <div className={styles.communitySettings}>
            <div className={styles.communitySettingsNav}>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings`)} style={{ color: "var(--accent)" }}>General</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)}>Pending Applications</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/echoes`)}>Pending Echoes</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)}>Blacklist</span>
            </div>
            <div className={styles.communitySettingsBody}>
              <span className={styles.communitysettingsBodyTitle}>General</span>
              <div className={styles.communitySettingsBodyContent}>
                <Form.TextInput
                  label="Community Name"
                  style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                  value={updatedCommunityData.displayName}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, displayName: e.target.value })}
                />
                <Form.AreaInput
                  label="Description"
                  style={{ width: "calc(50% - 10px)", height: "146px", float: "right", marginBottom: "20px" }}
                  value={updatedCommunityData.description}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, description: e.target.value })}
                  placeholder="A brief description of this community."
                />
                <Form.SelectSingleInput
                  label="Privacy"
                  style={{ width: "calc(50% - 10px)", float: "left", marginBottom: "20px" }}
                  value={updatedCommunityData.privacy}
                  setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, privacy: value })}
                  options={[
                    { label: "Public", value: "public" },
                    { label: "Private", value: "private" }
                  ]}
                />
                <Form.TextInput
                  label="Website"
                  style={{ width: "calc(33.33% - 14px)", float: "left", marginBottom: "20px" }}
                  value={updatedCommunityData.website}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, website: e.target.value })}
                  placeholder="The communitiy's official website."
                />
                <Form.SelectSingleInput
                  label="Country"
                  style={{ width: "calc(33.33% - 14px)", float: "left", marginBottom: "20px", marginLeft: "20px" }}
                  value={updatedCommunityData.country}
                  setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, country: value })}
                  options={[
                    { label: "Nigeria", value: "Nigeria" },
                    { label: "Ghana", value: "Ghana" },
                    { label: "Cameroon", value: "Cameroon" },
                    { label: "Niger", value: "Niger" }
                  ]}
                />
                <Form.SelectSingleInput
                  label="City"
                  style={{ width: "calc(33.33% - 14px)", float: "right", marginBottom: "20px", marginLeft: "20px" }}
                  value={updatedCommunityData.city}
                  setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, city: value })}
                  options={[
                    { label: "Lagos", value: "Lagos" },
                    { label: "Abeokuta", value: "Abeokuta" },
                    { label: "Akure", value: "Akure" },
                    { label: "Ibadan", value: "Ibadan" },
                  ]}
                />
                <Form.TextInput
                  label="Facebook"
                  style={{ width: "100%", float: "right", marginBottom: "20px" }}
                  value={updatedCommunityData.fSocial}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, fSocial: e.target.value })}
                  placeholder="The community's Facebook page."
                />
                <Form.TextInput
                  label="X"
                  style={{ width: "100%", float: "right", marginBottom: "20px" }}
                  value={updatedCommunityData.tSocial}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, tSocial: e.target.value })}
                  placeholder="The community's X page."
                />
                <Form.TextInput
                  label="Instagram"
                  style={{ width: "100%", float: "right", marginBottom: "20px" }}
                  value={updatedCommunityData.iSocial}
                  onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, iSocial: e.target.value })}
                  placeholder="The community's Instagram page."
                />
                <div className={styles.communitySettingsFormButtons}>
                  <button className={styles.communitySettingsFormRevertHalf} onClick={() => setUpdatedCommunityData(communityData)}>Revert Changes</button>
                  <button className={styles.communitySettingsFormSubmitHalf} onClick={() => handleSubmitGeneral()}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}