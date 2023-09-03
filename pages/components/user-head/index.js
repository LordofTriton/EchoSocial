import React, { useState, useEffect } from "react";
import styles from './user-head.module.css';

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";

export default function UserHead({ data, page, title }) {
    const [userData, setUserData] = useState(data)

    useEffect(() => {
        setUserData(data)
    }, [data])

    const handleUpdateProfileCover = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (userData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${userData.profileCover.publicID}`);
        setUserData({ ...userData, profileCover: uploadedFile.data[0] })

        if (page.socket) page.socketMethods.socketEmitter("UPDATE_ACCOUNT", {
            accountID: page.activeUser.accountID,
            profileCover: uploadedFile.data[0]
        })
        page.cache.saveData("EchoUser", { ...userData, profileCover: uploadedFile.data[0] })
        page.setActiveUser({ ...page.activeUser, profileCover: uploadedFile.data[0] })
    }

    const handleUpdateProfileImage = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (userData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${userData.profileImage.publicID}`);
        setUserData({ ...userData, profileImage: uploadedFile.data[0] })

        if (page.socket) page.socketMethods.socketEmitter("UPDATE_ACCOUNT", {
            accountID: page.activeUser.accountID,
            profileImage: uploadedFile.data[0]
        })
        page.cache.saveData("EchoUser", { ...userData, profileImage: uploadedFile.data[0] })
        page.setActiveUser({ ...page.activeUser, profileImage: uploadedFile.data[0] })
    }

    const handleFollowButtonClick = async () => {
        if (!page.socket) return;
        if (userData.userHearted) setUserData({ ...userData, userHearted: false, hearts: userData.hearts - 1 })
        else setUserData({ ...userData, userHearted: true, hearts: userData.hearts + 1 })

        if (page.activeUser.accountID !== userData.accountID) page.socketMethods.socketEmitter(userData.userHearted ? "DELETE_HEART" : "CREATE_HEART", {
            accountID: page.activeUser.accountID,
            userID: userData.accountID
        })
        page.createAlert("success", "User liked successfully.")
    }

    const blockUser = async () => {
        if (page.socket & page.activeUser.accountID !== userData.accountID) {
            const blockedUser = (data) => {
                page.createAlert(data.success ? "success" : "error", data.success ? "User blocked successfully." : data.message)
            }
            page.socketMethods.socketRequest("CREATE_BLACKLIST", {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: userData.accountID
            }, blockedUser)
        }
    }

    return (
        <>
        <div className={styles.userHead}>
            <div className={styles.userHeadCover} style={{ backgroundImage: userData ? `url(${userData.profileCover.url})` : null }}>
                {
                    page.router.query.id === page.activeUser.accountID ?
                    <><label htmlFor="coverSelector" className={styles.userHeadCoverButton}><SVGServer.ImageIcon color="var(--alt)" width="20px" height="20px" /></label>
                    <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                    </> : null
                }
                <div className={styles.userHeadBar}></div>
                <div className={styles.userHeadData}>
                    <div className={styles.userHeadProfile} style={{ backgroundImage: userData ? `url(${userData.profileImage.url})` : null }}>
                        {
                            page.router.query.id === page.activeUser.accountID ?
                            <><label htmlFor="profileSelector" className={styles.userHeadProfileButton}><SVGServer.CameraIcon color="var(--primary)" width="20px" height="20px" /></label>
                            <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                            </>: null
                        }
                    </div>
                    <div className={styles.userHeadNames}>
                        <span className={styles.userHeadName}>{userData ? `${userData.firstName} ${userData.lastName}` : " "}</span>
                        <span className={styles.userHeadNickName}>{userData ? userData.nickname : ""}</span>
                    </div>
                </div>
            </div>
            <div className={styles.userHeadButtons}>
                {
                    page.router.query.id === page.activeUser.accountID ?
                        <>
                            <div className={styles.userHeadButton} onClick={() => page.router.push("/settings")}>
                                <SVGServer.SettingsIcon color="var(--primary)" width="20px" height="20px" />
                                <span>Settings</span>
                            </div>
                            </> :
                        <>
                            <div className={styles.userHeadButton} onClick={() => handleFollowButtonClick()} style={{borderColor: userData && userData.userHearted ? "var(--accent)" : null}}>
                                {
                                    userData && userData.userHearted ?
                                        <SVGServer.HeartFilledIcon color="var(--accent)" width="20px" height="20px" /> :
                                        <SVGServer.HeartLineIcon color="var(--primary)" width="20px" height="20px" />
                                }
                                <span style={{color: userData && userData.userHearted ? "var(--accent)" : null}}>{userData && userData.userHearted ? "Liked" : "Like"}</span>
                            </div>
                            {
                                userData && userData.userFriend ?
                                <div className={styles.userHeadButton} onClick={() => handleFollowButtonClick()}>
                                    <SVGServer.ChatIcon color="var(--primary)" width="20px" height="20px" />
                                    <span>Message</span>
                                </div> : null
                            }
                        </>
                }
            </div>
        </div>

        <div className={styles.userHeadNavLinks}>
            <span className={styles.userHeadNavLink} style={{color: title === "timeline" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}`)}>Timeline</span>
            <span className={styles.userHeadNavLink} style={{color: title === "about" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/about`)}>About</span>
            <span className={styles.userHeadNavLink} style={{color: title === "friends" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/friends`)}>Friends</span>
            <span className={styles.userHeadNavLink} style={{color: title === "communities" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/communities`)}>Communities</span>
            <span className={styles.userHeadNavLink} style={{color: title === "media" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/media`)}>Media</span>
            { userData && userData.accountID === page.activeUser.accountID ? <span className={styles.userHeadNavLink} style={{color: title === "media" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/saved`)}>Saved</span> : null }
            {
                userData && userData.accountID !== page.activeUser.accountID ? 
                <div className={styles.userHeadOptions}>
                    <span className={styles.userHeadNavLink}>
                        <SVGServer.OptionIcon color="var(--primary)" width="25px" height="25px" />
                    </span>
                    <div className={styles.userHeadOptionBox}>
                        <span className={styles.userHeadOption} onClick={() => blockUser()}>Block {userData ? userData.firstName : "User"}</span>
                        <span className={styles.userHeadOption}>Report {userData ? userData.firstName : "User"}</span>
                    </div>
                </div> : null
            }
        </div>
        </>
    )
}