import React, { useState, useEffect } from "react";
import styles from "./community-head.module.css"
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";

export default function CommunityHead({ data, page, title }) {
    const [communityData, setCommunityData] = useState(data)

    useEffect(() => {
        setCommunityData(data)
    }, [data])

    const handleUpdateProfileCover = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (communityData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileCover.publicID}`);
        setCommunityData({ ...communityData, profileCover: uploadedFile.data[0] })

        if (page.socket) page.socketMethods.socketEmitter("UPDATE_COMMUNITY", {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            profileCover: uploadedFile.data[0]
        })
    }

    const handleUpdateProfileImage = async (e) => {
        const formData = new FormData();
        formData.append(`media`, e.target.files[0])
        const uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert({ type: "error", message: uploadedFile.message })
            return;
        }
        if (communityData.profileImage.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileImage.publicID}`);
        setCommunityData({ ...communityData, profileImage: uploadedFile.data[0] })

        if (page.socket) page.socketMethods.socketEmitter("UPDATE_COMMUNITY", {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            profileImage: uploadedFile.data[0]
        })
    }

    const handleLeaveGroup = async () => {
        if (!page.socket) return;
        page.socketMethods.socketEmitter("DELETE_MEMBER", {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            userID: page.activeUser.accountID
        })
        page.createAlert("success", "Left community successfully.")
        page.router.push("/communities/discover")
    }

    const handleJoinGroup = async () => {
        if (communityData.userMember) return;
        if (communityData.userApplied) return;
        else {
            if (communityData.entryApproval) {
                const createdApplication = (data) => setCommunityData({...communityData, userApplied: true})
                if (page.socket) page.socketMethods.socketRequest("CREATE_APPLICATION", {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdApplication)
            } else {
                const createdMember = (data) => {
                    setCommunityData({ ...communityData, memberCount: communityData.memberCount + 1 })
                    page.createAlert("success", "Joined community successfully.")
                }
                if (page.socket) page.socketMethods.socketRequest("CREATE_MEMBER", {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdMember)
            }
        }
    }

    const blockCommunity = async () => {
        if (communityData && communityData.userMember && communityData.userMember.role !== "member") return;
        if (page.socket) {
            page.socketMethods.socketEmitter("CREATE_BLACKLIST", {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: communityData.accountID,
                blockeeType: "community"
            })
            page.createAlert("success", "Community blocked successfully.")
        }
    }

    return (
        <>
        <div className={styles.communityHead}>
            <div className={styles.communityHeadCover} style={{ backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null }}>
                {
                    communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                    <><label htmlFor="coverSelector" className={styles.communityHeadCoverButton}><SVGServer.ImageIcon color="var(--alt)" width="20px" height="20px" /></label>
                    <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                    </> : null
                }
                <div className={styles.communityHeadBar}></div>
                <div className={styles.communityHeadData}>
                    <div className={styles.communityHeadProfile} style={{ backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null }}>
                        {
                            communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                            <><label htmlFor="profileSelector" className={styles.communityHeadProfileButton}><SVGServer.CameraIcon color="var(--primary)" width="20px" height="20px" /></label>
                            <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                            </>: null
                        }
                    </div>
                    <div className={styles.communityHeadNames}>
                        <span className={styles.communityHeadName}><span className="titleGradient">{communityData ? communityData.displayName : " "}</span></span>
                        <span className={styles.communityHeadNickName}>Community</span>
                    </div>
                </div>
            </div>
            <div className={styles.communityHeadButtons}>
                {
                    communityData && communityData.userMember ?
                    <>
                    <div className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                        <SVGServer.ExitIcon color="var(--primary)" width="20px" height="20px" />
                        <span>Leave</span>
                    </div> 
                    <div className={styles.communityHeadButton} onClick={() => blockCommunity()} style={{backgroundColor: communityData && communityData.userBlocked ? "var(--accent)" : "var(--surface)"}}>
                        <SVGServer.BlockIcon color={communityData && communityData.userBlocked ? "var(--surface)" : "var(--primary)"} width="20px" height="20px" />
                        <span style={{color: communityData && communityData.userBlocked ? "var(--surface)" : "var(--primary)"}}>{communityData && communityData.userBlocked ? "Unblock" : "Block"}</span>
                    </div>
                    </> : 
                    communityData && !communityData.userApplied ?
                    <div className={styles.communityHeadButton} onClick={() => handleJoinGroup()}>
                        <SVGServer.EnterIcon color="var(--primary)" width="20px" height="20px" />
                        <span>{ communityData && communityData.entryApproval ? "Apply to Join" : "Join"}</span>
                    </div> : 
                    <div className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                        <SVGServer.EnterIcon color="var(--primary)" width="20px" height="20px" />
                        <span>Applied</span>
                    </div>
                }
            </div>
        </div>

        <div className={styles.communityHeadNavLinks}>
            <span className={styles.communityHeadNavLink} style={{color: title === "timeline" ? "var(--accent)" : null}} onClick={() => page.router.push(`/communities/${communityData.communityID}`)}>Timeline</span>
            <span className={styles.communityHeadNavLink} style={{color: title === "about" ? "var(--accent)" : null}} onClick={() => page.router.push(`/communities/${communityData.communityID}/about`)}>About</span>
            <span className={styles.communityHeadNavLink} style={{color: title === "members" ? "var(--accent)" : null}} onClick={() => page.router.push(`/communities/${communityData.communityID}/members`)}>Members</span>
            <span className={styles.communityHeadNavLink} style={{color: title === "media" ? "var(--accent)" : null}} onClick={() => page.router.push(`/communities/${communityData.communityID}/media`)}>Media</span>
            { communityData && communityData.userMember && communityData.userMember.role !== "member" ? <span className={styles.communityHeadNavLink} style={{color: title === "settings" ? "var(--accent)" : null}} onClick={() => page.router.push(`/communities/${communityData.communityID}/settings`)}>Settings</span> : null }
        </div>
        </>
    )
}