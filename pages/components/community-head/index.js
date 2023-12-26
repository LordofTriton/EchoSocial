import React, { useState, useEffect } from "react";
import styles from "./community-head.module.css"
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import AccessBlocker from "../access-blocker";
import Helpers from "../../../util/Helpers";
import Loader from "../loader";

export default function CommunityHead({ data, page, title }) {
    const [communityData, setCommunityData] = useState(data)
    const [profileLoader, setProfileLoader] = useState(false)
    const [coverLoader, setCoverLoader] = useState(false)

    useEffect(() => {
        setCommunityData(data)
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
        const uploadedFile = (await APIClient.post(APIClient.routes.uploadFile, formData, null, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert("error", uploadedFile.message)
            return;
        }
        if (communityData.profileCover.publicID) await APIClient.del(`/cloud/delete?publicID=${communityData.profileCover.publicID}`);
        setCommunityData({ ...communityData, profileCover: uploadedFile.data[0] })
        setCoverLoader(false)

        APIClient.post(APIClient.routes.updateCommunity, {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            profileCover: uploadedFile.data[0]
        })
    }

    const handleUpdateProfileImage = async (e) => {
        e.stopPropagation()
        setProfileLoader(true)
        const file = e.target.files[0];
        if (!file) return;
        if (file.size >= 6291456) {
            page.createAlert("error", "File size must be lower than 6 MB.")
            setProfileLoader(false)
            return;
        }

        const formData = new FormData();
        formData.append(`media`, file)
        const uploadedFile = (await APIClient.post(APIClient.routes.uploadFile, formData, null, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert("error", uploadedFile.message)
            return;
        }
        
        const createdEcho = (data) => {
            if (!data.success) return;
            const updated = { ...uploadedFile.data[0], echo: data.data }

            APIClient.post(APIClient.routes.updateCommunity, {
                accountID: page.activeUser.accountID,
                communityID: communityData.communityID,
                profileImage: {
                    ...uploadedFile.data[0],
                    echoID: data.data.echoID
                }
            })
            setProfileLoader(false)
            setCommunityData({ ...communityData, profileImage: updated })
            page.createAlert("success", "Profile Image updated successfully.")
        }
        APIClient.post(APIClient.routes.createEcho, {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            audience: communityData.displayName,
            nodes: [communityData.node.nodeID],
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
        APIClient.del(APIClient.routes.deleteCommunityMember, {
            accountID: page.activeUser.accountID,
            communityID: communityData.communityID,
            userID: page.activeUser.accountID
        })
        page.createAlert("success", "Left community successfully.")
        page.router.reload()
    }

    const handleJoinGroup = async () => {
        if (communityData.userMember) return;
        if (communityData.userApplied) return;
        else {
            if (communityData.entryApproval) {
                const createdApplication = (data) => setCommunityData({...communityData, userApplied: true})
                APIClient.post(APIClient.routes.createCommunityApplication, {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdApplication)
            } else {
                const createdMember = (data) => {
                    setCommunityData({ ...communityData, memberCount: communityData.memberCount + 1, userMember: true })
                    page.router.reload()
                    page.createAlert("success", "Joined community successfully.")
                }
                APIClient.post(APIClient.routes.createCommunityMember, {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdMember)
            }
        }
    }

    const blockCommunity = async () => {
        if (communityData && communityData.userMember && communityData.userMember.role !== "member") return;
        APIClient.post(APIClient.routes.createBlacklist, {
            accountID: page.activeUser.accountID,
            blocker: page.activeUser.accountID,
            blockee: communityData.accountID,
            blockeeType: "community"
        })
        page.createAlert("success", "Community blocked successfully.")
    }

    return (
        <>
        <div className={styles.communityHead}>
            <div className={styles.communityHeadCover} style={{ backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null }}>
                {
                    communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                    <>
                        <label htmlFor="coverSelector" className={styles.communityHeadCoverButton}>
                        { coverLoader ? <Loader size="20px" thickness="3px" color="white" style={{margin: "0px calc(50% - 10px) 0px calc(50% - 10px)"}} /> : <SVGServer.ImageIcon color="white" width="20px" height="20px" /> }
                        </label>
                        <input type="file" id="coverSelector" accept="image/*" size="6144000" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />
                    </> : null
                }
                <div className={styles.communityHeadBar}></div>
                <div className={styles.communityHeadData}>
                <div className={styles.communityHeadProfile} style={{ backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null }} onClick={() => communityData.profileImage.echo ? page.setShowMediaViewer(communityData.profileImage.echo) : null}>
                    {
                        communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                        <>
                            <label htmlFor="profileSelector" className={styles.communityHeadProfileButton}>
                            { profileLoader ? <Loader size="20px" thickness="3px" color="var(--primary)" style={{margin: "0px calc(50% - 10px) 0px calc(50% - 10px)"}} /> : <SVGServer.CameraIcon color="var(--primary)" width="20px" height="20px" /> }
                            </label>
                            <input type="file" id="profileSelector" accept="image/*" size="6144000" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                        </> : null
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