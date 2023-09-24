import React, { useState, useEffect } from "react";
import styles from './user-head.module.css';

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import AccessBlocker from "../access-blocker";

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
        page.cookies.saveData("EchoActiveUser", { ...userData, profileCover: uploadedFile.data[0] })
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
        page.cookies.saveData("EchoActiveUser", { ...userData, profileImage: uploadedFile.data[0] })
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
    }

    const blockUser = async () => {
        if (page.socket && page.activeUser.accountID !== userData.accountID) {
            page.socketMethods.socketEmitter("CREATE_BLACKLIST", {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: userData.accountID,
                blockeeType: "user"
            })
            page.createAlert("success", "User blocked successfully.")
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
                        <span className={styles.userHeadName}><span className="titleGradient">{userData ? `${userData.firstName} ${userData.lastName}` : " "}</span></span>
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
                            {
                                userData && userData.settings.followable ?
                                <div className={styles.userHeadButton} onClick={() => handleFollowButtonClick()} style={{backgroundColor: userData && userData.userHearted ? "var(--accent)" : "rgba(0, 0, 0, 0.7)"}}>
                                    {
                                        userData && userData.userHearted ?
                                            <SVGServer.HeartFilledIcon color="var(--surface)" width="20px" height="20px" /> :
                                            <SVGServer.HeartLineIcon color="var(--primary)" width="20px" height="20px" />
                                    }
                                    <span style={{color: userData && userData.userHearted ? "var(--surface)" : "var(--primary)"}}>{userData && userData.userHearted ? "Liked" : "Like"}</span>
                                </div>
                                : null
                            }
                            {
                                userData && userData.userFriend ?
                                <div className={styles.userHeadButton} onClick={() => page.setActiveChat(userData.userChat)}>
                                    <SVGServer.ChatIcon color="var(--primary)" width="20px" height="20px" />
                                    <span>Message</span>
                                </div> : null
                            }
                            <div className={styles.userHeadButton} onClick={() => blockUser()} style={{backgroundColor: userData && userData.userBlocked ? "var(--accent)" : "rgba(0, 0, 0, 0.7)"}}>
                                <SVGServer.BlockIcon color={userData && userData.userBlocked ? "var(--surface)" : "var(--primary)"} width="20px" height="20px" />
                                <span style={{color: userData && userData.userBlocked ? "var(--surface)" : "var(--primary)"}}>{userData && userData.userBlocked ? "Unblock" : "Block"}</span>
                            </div>
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
        </div>
        
        {
          userData && userData.blockedUser ?
            <AccessBlocker 
              icon="block" 
              title="This user has blocked you."
              message="This user has added you to their blacklist. You cannot see their data or view their echoes or interact with their profile in any way till you're off the blacklist." 
              buttonText="Return to Feed"
              buttonCallback={() => page.router.push("/")}
            /> : null
        }
        </>
    )
}