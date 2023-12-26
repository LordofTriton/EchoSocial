import React, { useState, useEffect } from "react";
import styles from './user-head.module.css';

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import AccessBlocker from "../access-blocker";
import Helpers from "../../../util/Helpers";
import Loader from "../loader";

export default function UserHead({ data, page, title }) {
    const [userData, setUserData] = useState(data)
    const [profileLoader, setProfileLoader] = useState(false)
    const [coverLoader, setCoverLoader] = useState(false)

    useEffect(() => {
        setUserData(data)
    }, [data])

    const handleUpdateProfileCover = async (e) => {
        e.stopPropagation()
        setCoverLoader(true)
        const file = e.target.files[0]
        if (!file) return;
        if (file.size >= 6291456) {
            page.createAlert("error", "File size must be lower than 6 MB.")
            setCoverLoader(false)
            return;
        }

        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = await APIClient.post(APIClient.routes.uploadFile, formData, null, { 'Content-Type': "multipart/form-data" });
        if (!uploadedFile.success) {
            page.createAlert("error", uploadedFile.message)
            return;
        }
        if (userData.profileCover.publicID) await APIClient.del(APIClient.routes.deleteFile, { publicID: userData.profileCover.publicID });
        setUserData({ ...userData, profileCover: uploadedFile.data[0] })
        setCoverLoader(false)

        APIClient.post(APIClient.routes.updateAccount, {
            accountID: page.activeUser.accountID,
            profileCover: uploadedFile.data[0]
        })
        page.cookies.saveData("EchoActiveUser", { ...userData, profileCover: uploadedFile.data[0] })
        page.setActiveUser({ ...page.activeUser, profileCover: uploadedFile.data[0] })
    }

    const handleUpdateProfileImage = async (e) => {
        e.stopPropagation()
        setProfileLoader(true)
        const file = e.target.files[0]
        if (!file) return;
        if (file.size >= 6291456) {
            page.createAlert("error", "File size must be lower than 6 MB.")
            setProfileLoader(false)
            return;
        }

        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = await APIClient.post(APIClient.routes.uploadFile, formData, null, { 'Content-Type': "multipart/form-data" });
        if (!uploadedFile.success) {
            page.createAlert("error", uploadedFile.message)
            return;
        }
        
        const createdEcho = (data) => {
            if (!data.success) return;
            const updated = { ...uploadedFile.data[0], echo: data.data }

            APIClient.post(APIClient.routes.updateAccount, {
                accountID: page.activeUser.accountID,
                profileImage: {
                    ...uploadedFile.data[0],
                    echoID: data.data.echoID
                }
            })
            setProfileLoader(false)
            page.cookies.saveData("EchoActiveUser", { ...userData, profileImage: updated })
            page.setActiveUser({ ...page.activeUser, profileImage: updated })
            setUserData({ ...userData, profileImage: updated })
            page.createAlert("success", "Profile Image updated successfully.")
        }
        APIClient.post(APIClient.routes.createEcho, {
            accountID: page.activeUser.accountID,
            communityID: null,
            audience: "public",
            nodes: [],
            content: {
                text: null,
                media: [{
                    ...uploadedFile.data[0],
                    type: Helpers.getFileType(uploadedFile.data[0].url)
                }],
                link: null
            }
        }, createdEcho)
    }

    const handleFollowButtonClick = async () => {
        if (userData.userHearted) setUserData({ ...userData, userHearted: false, hearts: userData.hearts - 1 })
        else setUserData({ ...userData, userHearted: true, hearts: userData.hearts + 1 })

        if (page.activeUser.accountID !== userData.accountID) {
            if (userData.userHearted) {
                APIClient.del(APIClient.routes.deleteHeart, { 
                    accountID: page.activeUser.accountID,
                    userID: userData.accountID
                })
            } else {
                APIClient.post(APIClient.routes.createHeart, { 
                    accountID: page.activeUser.accountID,
                    userID: userData.accountID
                })
            }
        }
    }

    const blockUser = async () => {
        if (page.activeUser.accountID !== userData.accountID) {
            APIClient.post(APIClient.routes.createBlacklist, {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: userData.accountID,
                blockeeType: "user"
            })
            page.createAlert("success", "User blocked successfully.")
            setUserData({ ...userData, userBlocked: true })
        }
    }

    const unblockUser = async () => {
        if (page.activeUser.accountID !== userData.accountID) {
            APIClient.del(APIClient.routes.deleteBlacklist, {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: userData.accountID
            })
            page.createAlert("success", "User unblocked successfully.")
            setUserData({ ...userData, userBlocked: false })
        }
    }

    return (
        <>
        <div className={styles.userHead}>
            <div className={styles.userHeadCover} style={{ backgroundImage: userData ? `url(${userData.profileCover.url})` : null }}>
                {
                    page.router.query.id === page.activeUser.accountID ?
                    <>
                        <label htmlFor="coverSelector" className={styles.userHeadCoverButton}>
                        { coverLoader ? <Loader size="20px" thickness="3px" color="white" style={{margin: "0px calc(50% - 10px) 0px calc(50% - 10px)"}} /> : <SVGServer.ImageIcon color="white" width="20px" height="20px" /> }
                        </label>
                        <input type="file" id="coverSelector" accept="image/*" size="6144000" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                    </> : null
                }
                <div className={styles.userHeadBar}></div>
                <div className={styles.userHeadData}>
                    <div className={styles.userHeadProfile} style={{ backgroundImage: userData ? `url(${userData.profileImage.url})` : null }} onClick={() => userData.profileImage.echo ? page.setShowMediaViewer(userData.profileImage.echo) : null}>
                        {
                            page.router.query.id === page.activeUser.accountID ?
                            <>
                                <label htmlFor="profileSelector" className={styles.userHeadProfileButton}>
                                { profileLoader ? <Loader size="20px" thickness="3px" color="var(--primary)" style={{margin: "0px calc(50% - 10px) 0px calc(50% - 10px)"}} /> : <SVGServer.CameraIcon color="var(--primary)" width="20px" height="20px" /> }
                                </label>
                                <input type="file" id="profileSelector" accept="image/*" size="6144000" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
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
                            <span className={styles.userHeadButton} onClick={() => page.router.push("/settings")}>
                                <SVGServer.SettingsIcon color="var(--primary)" width="20px" height="20px" />
                                <span>Settings</span>
                            </span>
                            </> :
                        <>
                            {
                                userData && userData.settings.followable ?
                                <span className={styles.userHeadButton} onClick={() => handleFollowButtonClick()} style={{backgroundColor: userData && userData.userHearted ? "var(--accent)" : "var(--surface)"}}>
                                    {
                                        userData && userData.userHearted ?
                                            <SVGServer.HeartFilledIcon color="var(--surface)" width="20px" height="20px" /> :
                                            <SVGServer.HeartLineIcon color="var(--primary)" width="20px" height="20px" />
                                    }
                                    <span style={{color: userData && userData.userHearted ? "var(--surface)" : "var(--primary)"}}>{userData && userData.userHearted ? "Followed" : "Follow"}</span>
                                </span>
                                : null
                            }
                            {
                                userData && userData.userFriend ?
                                <span className={styles.userHeadButton} onClick={() => page.setActiveChat(userData.userChat)}>
                                    <SVGServer.ChatIcon color="var(--primary)" width="20px" height="20px" />
                                    <span>Message</span>
                                </span> : null
                            }
                            <span className={styles.userHeadButton} onClick={() => userData && userData.userBlocked ? unblockUser() : blockUser()} style={{backgroundColor: userData && userData.userBlocked ? "var(--accent)" : "var(--surface)"}}>
                                <SVGServer.BlockIcon color={userData && userData.userBlocked ? "var(--surface)" : "var(--primary)"} width="20px" height="20px" />
                                <span style={{color: userData && userData.userBlocked ? "var(--surface)" : "var(--primary)"}}>{userData && userData.userBlocked ? "Unblock" : "Block"}</span>
                            </span>
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
            { userData && userData.accountID === page.activeUser.accountID ? <span className={styles.userHeadNavLink} style={{color: title === "saved" ? "var(--accent)" : null}} onClick={() => page.router.push(`/user/${userData.accountID}/saved`)}>Saved</span> : null }
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