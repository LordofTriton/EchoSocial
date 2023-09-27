import React, { useState, useEffect } from "react";
import styles from "./community-head.module.css"
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import AccessBlocker from "../access-blocker";
import Helpers from "../../../util/Helpers";

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

        const createdEcho = (data) => {
            if (!data.success) return;
            const updated = { ...uploadedFile.data[0], echo: data.data }

            if (page.socket) page.socketMethods.socketEmitter("UPDATE_COMMUNITY", {
                accountID: page.activeUser.accountID,
                communityID: communityData.communityID,
                profileImage: {
                    ...uploadedFile.data[0],
                    echoID: data.data.echoID
                }
            })
            setCommunityData({ ...communityData, profileImage: updated })
            page.createAlert({ type: "success", message: "Profile Image updated successfully." })
        }
        if (page.socket) page.socketMethods.socketRequest("CREATE_ECHO", {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            audience: communityData.displayName,
            nodes: [communityData.node],
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
                <div className={styles.communityHeadProfile} style={{ backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null }} onClick={() => communityData.profileImage.echo ? page.setShowMediaViewer(communityData.profileImage.echo) : null}>
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
                    <span className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                        <SVGServer.ExitIcon color="var(--primary)" width="20px" height="20px" />
                        <span>Leave</span>
                    </span>
                    </> : 
                    communityData && !communityData.userApplied ?
                    <span className={styles.communityHeadButton} onClick={() => handleJoinGroup()}>
                        <SVGServer.EnterIcon color="var(--primary)" width="20px" height="20px" />
                        <span>{ communityData && communityData.entryApproval ? "Apply to Join" : "Join"}</span>
                    </span> : 
                    <span className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                        <SVGServer.EnterIcon color="var(--primary)" width="20px" height="20px" />
                        <span>Applied</span>
                    </span>
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

        {
          communityData && communityData.blockedUser ?
            <AccessBlocker 
              icon="block" 
              title="You've been banned from this community." 
              message="The admin/moderators of this community have added you to it's blacklist. You cannot see it's data or rejoin the community till you're off the blacklist. This also means you can't view or create echoes in this community as only members can perform those actions." 
              buttonText="Return to Feed"
              buttonCallback={() => page.router.push("/")}
            /> : null
        }
        </>
    )
}