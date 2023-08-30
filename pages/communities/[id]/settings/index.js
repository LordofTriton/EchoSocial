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

  const handleUpdateProfileCover = async (e) => {
    const formData = new FormData();
    formData.append(`media`, e.target.files[0])
    const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
    if (!uploadedFile.success) {
      createAlert({ type: "error", message: uploadedFile.message })
      return;
    }
    if (communityData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileCover.publicID}`);
    setCommunityData({ ...communityData, profileCover: uploadedFile.data[0] })

    if (socket) socketMethods.socketEmitter("UPDATE_COMMUNITY", {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      profileCover: uploadedFile.data[0]
    })
  }

  const handleUpdateProfileImage = async (e) => {
    const formData = new FormData();
    formData.append(`media`, e.target.files[0])
    const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
    if (!uploadedFile.success) {
      createAlert({ type: "error", message: uploadedFile.message })
      return;
    }
    if (communityData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileImage.publicID}`);
    setCommunityData({ ...communityData, profileImage: uploadedFile.data[0] })

    if (socket) socketMethods.socketEmitter("UPDATE_COMMUNITY", {
      accountID: activeUser.accountID,
      communityID: communityData.communityID,
      profileImage: uploadedFile.data[0]
    })
  }

  const handleLeaveGroup = async () => {

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
        <div className={styles.communityHead}>
          <div className={styles.communityHeadCover} style={{ backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null }}></div>
          <div className={styles.communityHeadNav}>
            <span className={styles.communityHeadNavName}>{communityData ? communityData.displayName : ""}</span>
            <span className={styles.communityHeadNavLink}><SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" /></span>
            <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/media`)}>Media</span>
            <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/members`)}>Members</span>
            <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}/about`)}>About</span>
            <span className={styles.communityHeadNavLink} onClick={() => router.push(`/communities/${communityData.communityID}`)}>Timeline</span>
          </div>
          <div className={styles.communityHeadProfile} style={{ backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null }}></div>
          <div className={styles.communityHeadButtons}>
            {
              communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                <>
                  <div className={styles.communityHeadButton} onClick={() => router.push("/settings")}>
                    <SVGServer.SettingsIcon color="var(--surface)" width="30px" height="30px" />
                  </div>

                  <label htmlFor="coverSelector" className={styles.communityHeadButton}><SVGServer.ImageIcon color="var(--surface)" width="30px" height="30px" /></label>
                  <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />

                  <label htmlFor="profileSelector" className={styles.communityHeadButton}><SVGServer.CameraIcon color="var(--surface)" width="30px" height="30px" /></label>
                  <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                </> :
                <div className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                  <SVGServer.LogoutIcon color="var(--surface)" width="30px" height="30px" />
                </div>
            }
          </div>
        </div>

        <div className={styles.communityFriends}>
          <div className={styles.communityTimelineFeedHead}>
            <span className={styles.communityTimelineFeedHeadTitle}>{`${communityData ? communityData.displayName : "Community"}'s `} Settings</span>
          </div>
          <div className={styles.communitySettings}>
            <div className={styles.communitySettingsNav}>
              <span className={styles.communitySettingsNavButton} onClick={() => setSettingsPage("general")} style={{ color: settingsPage === "general" ? "var(--accent)" : null }}>General</span>
              <span className={styles.communitySettingsNavButton} onClick={() => setSettingsPage("applications")} style={{ color: settingsPage === "applications" ? "var(--accent)" : null }}>Applications</span>
              <span className={styles.communitySettingsNavButton} onClick={() => setSettingsPage("blacklist")} style={{ color: settingsPage === "blacklist" ? "var(--accent)" : null }}>Blacklist</span>
            </div>
            <div className={styles.communitySettingsBody}>
              {
                settingsPage === "general" ?
                  <>
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
                    </div>
                  </>
                  : null
              }
            </div>
          </div>
        </div>
      </div>

      <Modals page={pageControl} />
    </div>
  )
}