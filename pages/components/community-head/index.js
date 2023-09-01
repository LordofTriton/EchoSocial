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

    return (
        <div className={styles.communityHead}>
            <div className={styles.communityHeadCover} style={{ backgroundImage: communityData ? `url(${communityData.profileCover.url})` : null }}></div>
            <div className={styles.communityHeadNav}>
                <span className={styles.communityHeadNavName}>{communityData ? communityData.displayName : ""}</span>
                <div className={styles.communityHeadOptions}>
                    <span className={styles.communityHeadNavLink}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                    </span>
                    <div className={styles.communityHeadOptionBox}>
                    {
                        communityData && communityData.userMember && communityData.userMember.role === "member" ?
                        <>
                        <span className={styles.communityHeadOption} onClick={() => blockUser()}>Block {communityData ? communityData.displayName : "Community"}</span>
                        <span className={styles.communityHeadOption}>Report {communityData ? communityData.displayName : "Community"}</span>
                        </> : null
                    }
                    </div>
                </div>
                <span className={styles.communityHeadNavLink} onClick={() => page.router.push(`/communities/${communityData.communityID}/media`)} style={{ color: title === "media" ? "var(--accent)" : null }}>Media</span>
                <span className={styles.communityHeadNavLink} onClick={() => page.router.push(`/communities/${communityData.communityID}/members`)} style={{ color: title === "members" ? "var(--accent)" : null }}>Members</span>
                <span className={styles.communityHeadNavLink} onClick={() => page.router.push(`/communities/${communityData.communityID}/about`)} style={{ color: title === "about" ? "var(--accent)" : null }}>About</span>
                <span className={styles.communityHeadNavLink} onClick={() => page.router.push(`/communities/${communityData.communityID}`)} style={{ color: title === "timeline" ? "var(--accent)" : null }}>Timeline</span>
            </div>
            <div className={styles.communityHeadProfile} style={{ backgroundImage: communityData ? `url(${communityData.profileImage.url})` : null }}></div>
            <div className={styles.communityHeadButtons}>
                {
                    communityData && communityData.userMember && communityData.userMember.role !== "member" ?
                        <>
                            <div className={styles.communityHeadButton} onClick={() => page.router.push(`/communities/${communityData.communityID}/settings`)}>
                                <SVGServer.SettingsIcon color="var(--surface)" width="30px" height="30px" />
                            </div>

                            <label htmlFor="coverSelector" className={styles.communityHeadButton}><SVGServer.ImageIcon color="var(--surface)" width="30px" height="30px" /></label>
                            <input type="file" id="coverSelector" accept="image/*" onChange={(e) => handleUpdateProfileCover(e)} style={{ display: "none" }} multiple />

                            <label htmlFor="profileSelector" className={styles.communityHeadButton}><SVGServer.CameraIcon color="var(--surface)" width="30px" height="30px" /></label>
                            <input type="file" id="profileSelector" accept="image/*" onChange={(e) => handleUpdateProfileImage(e)} style={{ display: "none" }} multiple />
                        </> :
                        <div className={styles.communityHeadButton} onClick={() => handleLeaveGroup()}>
                            <SVGServer.ExitIcon color="var(--surface)" width="30px" height="30px" />
                        </div>
                }
            </div>
        </div>
    )
}