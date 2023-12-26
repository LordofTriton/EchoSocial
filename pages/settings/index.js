import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import styles from "./settings.module.css"
import { useRouter } from 'next/router'

import CacheService from '../../services/CacheService'
import Modals from '../components/modals';
import SVGServer from '../../services/svg/svgServer'
import APIClient from "../../services/APIClient";
import { Form } from "../components/form";
import useModalStates from '../hooks/useModalStates'
import { useSSEContext } from '../../util/SocketProvider'
import { nickDict } from '../../services/generators/NIckGenerator'
import useDataStates from '../hooks/useDataStates'
import { Country, State, City }  from 'country-state-city';

export default function ProfileSettings() {
    const router = useRouter()
    const [activeUser, setActiveUser] = useState(CacheService.getData("EchoActiveUser"))
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem("EchoTheme") || "dark")
    const [userAccount, setUserAccount] = useState(activeUser)
    const [updatedData, setUpdatedData] = useState({
        firstName: activeUser.firstName,
        lastName: activeUser.lastName,
        nickname: activeUser.nickname,
        email: activeUser.email,
        dateOfBirth: activeUser.dateOfBirth,
        phone: "",
        country: "Nigeria",
        state: "Lagos",
        city: "Lagos",
        bio: "",
        gender: "None",
        occupation: "",
        maritalStatus: "Single",
        fSocial: "",
        tSocial: "",
        iSocial: ""
    })
    const [alert, setAlert] = useState(null)
    const {modalStates, modalControl} = useModalStates()
    const [showAccountDrop, setShowAccountDrop] = useState(true)
    const [countryList, setCountryList] = useState([])
    const [cityList, setCityList] = useState([])
    
    useEffect(() => {
        if (countryList.length < 1) setCountryList(Country.getAllCountries())
        if (updatedData.country) {
            const countryData = Country.getAllCountries().find((country) => country.name === updatedData.country)
            if (countryData) setCityList(City.getCitiesOfCountry(countryData.isoCode))
        }
    }, [updatedData.country, updatedData.city])

    const createAlert = (type, message) => {
        setAlert({ type, message })
        setTimeout(() => setAlert(null), 5000)
    }

    useEffect(() => {
        const getAccount = (data) => {
            if (data.success) {
                setUserAccount(data.data)
                setUpdatedData(data.data)
            } else createAlert("error", data.message)
        }
        if (activeUser.accountID) {
            APIClient.get(APIClient.routes.getAccount, { accountID: activeUser.accountID }, getAccount)
        }
    }, [])

    const handleSubmit = async () => {
        APIClient.post(APIClient.routes.updateAccount, updatedData)
        createAlert("success", "Settings updated successfully.")
        const data = {...activeUser, ...updatedData};
        setActiveUser(data)
        CacheService.saveData("EchoActiveUser", data)
    }

    const handleRevert = () => {
        setUpdatedData(userAccount)
    }

    const pageControl = {
        title: "Settings",
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

    const isValidData = () => {
        if (!updatedData.firstName || updatedData.firstName.trim().length < 3) return false;
        if (!updatedData.lastName || updatedData.lastName.trim().length < 3) return false;
        if (updatedData.nickname && (updatedData.nickname.trim().length < 3 || updatedData.nickname.trim().length > 15)) return false;
        if (!updatedData.email || updatedData.email.trim().length < 3 || !updatedData.email.includes("@")) return false;
        if (updatedData.phone && updatedData.phone.trim().length !== 11) return false;
        if (updatedData.bio && updatedData.bio.trim().length < 6) return false;
        if (updatedData.occupation && updatedData.occupation.trim().length < 3) return false;
        if (updatedData.fSocial && (updatedData.fSocial.trim().length < 6 || !updatedData.fSocial.includes("http"))) return false;
        if (updatedData.iSocial && (updatedData.iSocial.trim().length < 6 || !updatedData.iSocial.includes("http"))) return false;
        if (updatedData.tSocial && (updatedData.tSocial.trim().length < 6 || !updatedData.tSocial.includes("http"))) return false;
        return true;
    }

    return (
        <div className="page" style={{backgroundColor: "var(--base)"}}>
            <Head>
                <title>Echo - Settings</title>
                <meta name="description" content="A simple social media." />
                <link rel="icon" href="/newLogoIcon.ico" />
                <link rel="stylesheet" href={`/styles/themes/${activeTheme === "dark" ? 'classic-dark.css' : 'classic-light.css'}`} />
            </Head>

            <div className="pageContent" style={{backgroundColor: "var(--base)"}}>
                <div className={styles.settingsHead}></div>
                <div className={styles.settingsBody}>
                    <div className={styles.settingsBodyNav}>
                        <span className={styles.settingsBodyNavTitle}>Settings</span>

                        <div className={styles.settingsBodyNavButton} style={{ backgroundColor: "var(--base)" }} onClick={() => setShowAccountDrop(!showAccountDrop)}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ProfileIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Account</span>
                            <span className={styles.settingsBodyNavButtonArrow}><SVGServer.ArrowRight color="var(--secondary)" width="20px" height="20px" /></span>
                        </div>
                        {
                            showAccountDrop ?
                                <>
                                    <span className={styles.settingsBodySubNavButton} style={{ color: "var(--accent)" }} onClick={() => router.push("/settings")}>Profile Info</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/preferences")}>Preferences</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/nodes")}>Nodes</span>
                                    <span className={styles.settingsBodySubNavButton} onClick={() => router.push("/settings/change-password")}>Change/Reset Password</span>
                                </> : null
                        }
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/privacy")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.PrivacyIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Privacy</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/feed")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.FeedIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Feed</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/notifications")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.NotificationIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Notifications</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/messaging")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.ChatIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Chat & Messaging</span>
                        </div>
                        <div className={styles.settingsBodyNavButton} onClick={() => router.push("/settings/blacklist")}>
                            <span className={styles.settingsBodyNavButtonIcon}><SVGServer.BlockIcon color="var(--secondary)" width="30px" height="30px" /></span>
                            <span className={styles.settingsBodyNavButtonText}>Blacklist</span>
                        </div>
                    </div>
                    <div className={styles.settingsBodyContent}>
                        <div className={styles.formContainer}>
                            <span className={styles.formContainerTitle}>Profile Information</span>
                            <div className={styles.formContainerForm}>
                                <Form.HalfWrapper>
                                    <Form.TextInput
                                        label="First Name"
                                        style={{ float: "left", marginBottom: "20px" }}
                                        value={updatedData.firstName}
                                        onChange={(e) => setUpdatedData({ ...updatedData, firstName: e.target.value })}
                                        isValid={(value) => value.trim().length > 2}
                                        error="First Name must be more than 2 characters."
                                    />
                                    <Form.TextInput
                                        label="Last Name"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.lastName}
                                        onChange={(e) => setUpdatedData({ ...updatedData, lastName: e.target.value })}
                                        isValid={(value) => value.trim().length > 2}
                                        error="Last Name must be more than 2 characters."
                                    />
                                    <Form.TextInput
                                        label="Nickname"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.nickname}
                                        onChange={(e) => setUpdatedData({ ...updatedData, nickname: e.target.value })}
                                        placeholder="A fun nickname for yourself."
                                        isValid={(value) => value.trim().length > 2 && value.trim().length < 16}
                                        error="Nickname must be more than 2 characters and less than 16 characters."
                                    />
                                    <Form.TextInput
                                        label="Email"
                                        type="email"
                                        style={{ float: "left", marginBottom: "20px" }}
                                        value={updatedData.email}
                                        onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                                        isValid={(value) => value.trim().length > 3 && value.includes("@")}
                                        error="Please use a valid email."
                                    />
                                    <Form.SelectSingleInput
                                        label="Gender"
                                        style={{ float: "right" }}
                                        value={updatedData.gender}
                                        setValue={(value) => setUpdatedData({ ...updatedData, gender: value })}
                                        options={[
                                            { label: "Male", value: "Male" },
                                            { label: "Female", value: "Female" },
                                            { label: "Non Binary", value: "Non Binary" },
                                            { label: "Prefer not to say", value: "None" }
                                        ]}
                                    />
                                    <Form.DateInput
                                        label="Birthday"
                                        style={{ float: "left", marginBottom: "20px" }}
                                        value={updatedData.dateOfBirth}
                                        onChange={(e) => setUpdatedData({ ...updatedData, dateOfBirth: e.target.value })}
                                    />
                                </Form.HalfWrapper>

                                <Form.ThirdWrapper>
                                    <Form.TextInput
                                        label="Phone"
                                        type="tel"
                                        style={{ float: "left", marginBottom: "20px" }}
                                        value={updatedData.phone}
                                        onChange={(e) => setUpdatedData({ ...updatedData, phone: e.target.value })}
                                        placeholder="Your phone number."
                                        isValid={(value) => value.trim().length === 11}
                                        error="Please use a valid 11 digit phone number."
                                    />
                                    <Form.SelectSingleInput
                                        label="Country"
                                        style={{ float: "left" }}
                                        value={updatedData.country}
                                        setValue={(value) => setUpdatedData({ ...updatedData, country: value })}
                                        options={countryList.map((country) => { return { label: country.name, value: country.name }})}
                                    />
                                    <Form.SelectSingleInput
                                        label="City"
                                        style={{ float: "right" }}
                                        value={updatedData.city}
                                        setValue={(value) => setUpdatedData({ ...updatedData, city: value })}
                                        options={cityList.map((city) => { return { label: city.name, value: city.name }})}
                                    />
                                </Form.ThirdWrapper>

                                <Form.HalfWrapper>
                                    <Form.AreaInput
                                        label="Bio"
                                        style={{ float: "left", marginBottom: "20px" }}
                                        value={updatedData.bio}
                                        onChange={(e) => setUpdatedData({ ...updatedData, bio: e.target.value })}
                                        placeholder="A few words about you."
                                        isValid={(value) => value.trim().length > 6}
                                        error="Bio must be more than 5 characters."
                                    />
                                    <Form.TextInput
                                        label="Occupation"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.occupation}
                                        onChange={(e) => setUpdatedData({ ...updatedData, occupation: e.target.value })}
                                        placeholder="What do you do?"
                                        isValid={(value) => value.trim().length > 3}
                                        error="Occupation must be more than 3 characters."
                                    />
                                    <Form.SelectSingleInput
                                        label="Marital Status"
                                        style={{ float: "right" }}
                                        value={updatedData.maritalStatus}
                                        setValue={(value) => setUpdatedData({ ...updatedData, maritalStatus: value })}
                                        options={[
                                            { label: "Single", value: "Single" },
                                            { label: "Married", value: "Married" },
                                            { label: "Divorced", value: "Divorced" },
                                            { label: "It's Complicated", value: "It's Complicated" }
                                        ]}
                                    />
                                </Form.HalfWrapper>

                                <Form.FullWrapper>
                                    <Form.TextInput
                                        label="Facebook"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.fSocial}
                                        onChange={(e) => setUpdatedData({ ...updatedData, fSocial: e.target.value })}
                                        placeholder="Link your Facebook page."
                                        isValid={(value) => value.trim().length > 6 && value.inludes("http")}
                                        error="Please use a valid url."
                                    />
                                    <Form.TextInput
                                        label="X"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.tSocial}
                                        onChange={(e) => setUpdatedData({ ...updatedData, tSocial: e.target.value })}
                                        placeholder="Link your X page."
                                        isValid={(value) => value.trim().length > 6 && value.inludes("http")}
                                        error="Please use a valid url."
                                    />
                                    <Form.TextInput
                                        label="Instagram"
                                        style={{ float: "right", marginBottom: "20px" }}
                                        value={updatedData.iSocial}
                                        onChange={(e) => setUpdatedData({ ...updatedData, iSocial: e.target.value })}
                                        placeholder="Link your Instagram page."
                                        isValid={(value) => value.trim().length > 6 && value.inludes("http")}
                                        error="Please use a valid url."
                                    />
                                </Form.FullWrapper>

                                <div className={styles.formContainerFormButtons}>
                                    <button className={styles.formContainerFormRevertHalf} onClick={() => handleRevert()}>Revert Changes</button>
                                    <button className={styles.formContainerFormSubmitHalf} style={{opacity: isValidData() ? "1" : "0.5"}} onClick={() => isValidData() ? handleSubmit() : null}>Save Changes</button>
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