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
import useDataStates from '../../../hooks/useDataStates';
import { useSSEContext } from '../../../../util/SocketProvider';
import DateGenerator from '../../../../services/generators/DateGenerator';
import DuoMasonryLayout from '../../../components/masonry/duo-masonry';
import { Form } from '../../../components/form';
import CommunityHead from '../../../components/community-head';
import { City, Country } from 'country-state-city';

export default function CommunitySettings() {
  const router = useRouter()
  const {modalStates, modalControl} = useModalStates()
  const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
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
  const [settingsPage, setSettingsPage] = useState("general")
  const [countryList, setCountryList] = useState([])
  const [cityList, setCityList] = useState([])
  
  useEffect(() => {
      if (countryList.length < 1) setCountryList(Country.getAllCountries())
      if (updatedCommunityData.country) {
          const countryData = Country.getAllCountries().find((country) => country.name === updatedCommunityData.country)
          if (countryData) setCityList(City.getCitiesOfCountry(countryData.isoCode))
      }
  }, [updatedCommunityData.country, updatedCommunityData.city])

  useEffect(() => {
    const updateCommunityData = (data) => {
      if (data.success) {
        setCommunityData(data.data)
        setUpdatedCommunityData({ ...updateCommunityData, ...data.data })
      } else createAlert("error", data.message)
    }
    if (router.query.id) {
      APIClient.get(APIClient.routes.getCommunity, {
        accountID: activeUser.accountID,
        communityID: router.query.id
      }, updateCommunityData)
    }
  }, [router.query])

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

  const handleSubmitGeneral = async () => {
    APIClient.post(APIClient.routes.updateCommunity, {
      accountID: activeUser.accountID,
      ...updatedCommunityData
    })
    createAlert("success", "Updated community succesfully.")
  }

  const isValidData = () => {
    if (updatedCommunityData.displayName.length < 4) return false;
    if (updatedCommunityData.description.length < 10) return false;
    if (updatedCommunityData.website && updatedCommunityData.website.length < 4) return false;
    if (updatedCommunityData.fSocial && (updatedCommunityData.fSocial.trim().length < 6 || !updatedCommunityData.fSocial.includes("http"))) return false;
    if (updatedCommunityData.iSocial && (updatedCommunityData.iSocial.trim().length < 6 || !updatedCommunityData.iSocial.includes("http"))) return false;
    if (updatedCommunityData.tSocial && (updatedCommunityData.tSocial.trim().length < 6 || !updatedCommunityData.tSocial.includes("http"))) return false;
  }

  return (
    <div className="page" style={{ backgroundColor: "var(--base)" }}>
      <Head>
        <title>Echo - {communityData ? communityData.displayName : "Community"}</title>
        <meta name="description" content="A simple social media." />
        <link rel="icon" href="/newLogoIcon.ico" />
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
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/nodes`)}>Nodes</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/permissions`)}>Permissions</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/applications`)}>Pending Applications</span>
              <span className={styles.communitySettingsNavButton} onClick={() => router.push(`/communities/${communityData.communityID}/settings/blacklist`)}>Blacklist</span>
            </div>
            <div className={styles.communitySettingsBody}>
              <span className={styles.communitysettingsBodyTitle}>General</span>
              <div className={styles.communitySettingsBodyContent}>
                <Form.HalfWrapper>
                  <Form.TextInput
                    label="Community Name"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.displayName}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, displayName: e.target.value })}
                    isValid={(value) => value.trim().length > 4}
                    error="Community name must be at least 4 characters."
                  />
                  <Form.AreaInput
                    label="Description"
                    style={{ height: "146px", float: "right", marginBottom: "20px" }}
                    value={updatedCommunityData.description}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, description: e.target.value })}
                    placeholder="A brief description of this community."
                    isValid={(value) => value.trim().length > 10}
                    error="Community description must be at least 10 characters."
                  />
                  <Form.SelectSingleInput
                    label="Privacy"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.privacy}
                    setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, privacy: value })}
                    options={[
                      { label: "Public", value: "public" },
                      { label: "Private", value: "private" }
                    ]}
                  />
                </Form.HalfWrapper>

                <Form.ThirdWrapper>
                  <Form.TextInput
                    label="Website"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.website}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, website: e.target.value })}
                    placeholder="The communitiy's official website."
                    isValid={(value) => value.trim().length > 4 && value.includes(".")}
                    error="Please use a valid webiste."
                  />
                  <Form.SelectSingleInput
                    label="Country"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.country}
                    setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, country: value })}
                    options={countryList.map((country) => { return { label: country.name, value: country.name }})}
                  />
                  <Form.SelectSingleInput
                    label="City"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.city}
                    setValue={(value) => setUpdatedCommunityData({ ...updatedCommunityData, city: value })}
                    options={cityList.map((city) => { return { label: city.name, value: city.name }})}
                  />
                </Form.ThirdWrapper>
                
                <Form.FullWrapper>
                  <Form.TextInput
                    label="Facebook"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.fSocial}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, fSocial: e.target.value })}
                    placeholder="The community's Facebook page."
                  />
                  <Form.TextInput
                    label="X"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.tSocial}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, tSocial: e.target.value })}
                    placeholder="The community's X page."
                  />
                  <Form.TextInput
                    label="Instagram"
                    style={{ float: "left", marginBottom: "20px" }}
                    value={updatedCommunityData.iSocial}
                    onChange={(e) => setUpdatedCommunityData({ ...updatedCommunityData, iSocial: e.target.value })}
                    placeholder="The community's Instagram page."
                  />
                </Form.FullWrapper>

                <div className={styles.communitySettingsFormButtons}>
                  <button className={styles.communitySettingsFormRevertHalf} onClick={() => setUpdatedCommunityData(communityData)}>Revert Changes</button>
                  <button className={styles.communitySettingsFormSubmitHalf} style={{opacity: isValidData() ? "1" : "0.5"}} onClick={() => isValidData() ? handleSubmitGeneral() : null}>Save Changes</button>
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