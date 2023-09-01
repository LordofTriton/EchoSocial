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
        <div className={styles.userHead}>
            <div className={styles.userHeadCover} style={{ backgroundImage: userData ? `url(${userData.profileCover.url})` : null }}></div>
            <div className={styles.userHeadNav}>
                <div className={styles.userHeadNavThird}>
                    <span className={styles.userHeadNavLinkLeft} onClick={() => page.router.push(`/user/${page.router.query.id}`)} style={{ color: title === "timeline" ? "var(--accent)" : null }}>Timeline</span>
                    <span className={styles.userHeadNavLinkLeft} onClick={() => page.router.push(`/user/${page.router.query.id}/about`)} style={{ color: title === "about" ? "var(--accent)" : null }}>About</span>
                    <span className={styles.userHeadNavLinkLeft} onClick={() => page.router.push(`/user/${page.router.query.id}/friends`)} style={{ color: title === "friends" ? "var(--accent)" : null }}>Friends</span>
                </div>
                <div className={styles.userHeadNavThird}>
                    <span className={styles.userHeadNavName}>{userData ? `${userData.firstName} ${userData.lastName}` : ""}</span>
                    <span className={styles.userHeadNavNickName}>{userData ? userData.nickname : ""}</span>
                </div>
                <div className={styles.userHeadNavThird}>
                    <div className={styles.userHeadOptions}>
                        <span className={styles.userHeadNavLinkRight}>
                            <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        </span>
                        <div className={styles.userHeadOptionBox}>
                            {userData && userData.accountID !== page.activeUser.accountID ? <span className={styles.userHeadOption} onClick={() => blockUser()}>Block {userData ? userData.firstName : "User"}</span> : null}
                            {userData && userData.accountID !== page.activeUser.accountID ? <span className={styles.userHeadOption}>Report {userData ? userData.firstName : "User"}</span> : null}
                            {userData && userData.accountID === page.activeUser.accountID ? <span className={styles.userHeadOption} onClick={() => page.router.push(`/user/${page.router.query.id}/saved`)}>Saved</span> : null}
                        </div>
                    </div>
                    <span className={styles.userHeadNavLinkRight} onClick={() => page.router.push(`/user/${page.router.query.id}/media`)} style={{ color: title === "media" ? "var(--accent)" : null }}>Media</span>
                    <span className={styles.userHeadNavLinkRight} onClick={() => page.router.push(`/user/${page.router.query.id}/communities`)} style={{ color: title === "communities" ? "var(--accent)" : null }}>Communities</span>
                </div>
            </div>
            <div className={styles.userHeadProfile} style={{ backgroundImage: userData ? `url(${userData.profileImage.url})` : null }}></div>
            <div className={styles.userHeadButtons}>
                {
                    page.router.query.id === page.activeUser.accountID ?
                        <>
                            <div className={styles.userHeadButton} onClick={() => page.router.push("/settings")}>
                                <SVGServer.SettingsIcon color="var(--surface)" width="30px" height="30px" />
                            </div>
                            <label htmlFor="coverSelector" className={styles.userHeadButton}><SVGServer.ImageIcon color="var(--surface)" width="30px" height="30px" /></label>
                            <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                            <label htmlFor="profileSelector" className={styles.userHeadButton}><SVGServer.CameraIcon color="var(--surface)" width="30px" height="30px" /></label>
                            <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                        </> :
                        <>
                            <div className={styles.userHeadButton} onClick={() => handleFollowButtonClick()}>
                                {
                                    userData && userData.userHearted ?
                                        <SVGServer.HeartFilledIcon color="var(--surface)" width="30px" height="30px" /> :
                                        <SVGServer.HeartLineIcon color="var(--surface)" width="30px" height="30px" />
                                }
                            </div>
                        </>
                }
            </div>
        </div>
    )
}