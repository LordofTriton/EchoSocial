import React, { useEffect, useState } from "react";
import styles from "./community-thumb.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";

export default function CommunityThumb({ data, page, member }) {
    const [applied, setApplied] = useState(data.userApplied || false)
    const [communityData, setCommunityData] = useState(data)

    const handleClickButton = async () => {
        if (member) page.router.push(`/communities/${communityData.communityID}`)
        if (applied) return;
        else {
            if (communityData.entryApproval) {
                const createdApplication = (data) => setApplied(true)
                APIClient.post(APIClient.routes.createCommunityApplication, {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdApplication)
            } else {
                const createdMember = (data) => {
                    setCommunityData({ ...communityData, memberCount: communityData.memberCount + 1 })
                    page.router.push(`/communities/${communityData.communityID}`)
                }
                APIClient.post(APIClient.routes.createCommunityMember, {
                    accountID: page.activeUser.accountID,
                    communityID: communityData.communityID
                }, createdMember)
            }
        }
    }

    return (
        <div className={styles.communityThumb}>
            <div className={styles.communityThumbCover} style={{backgroundImage: `url(${data.profileCover.url})`}}>
                <span>{communityData.privacy}</span>
            </div>
            <div className={styles.communityThumbProfile} style={{backgroundImage: `url(${data.profileImage.url})`}} onClick={() => page.router.push(`/communities/${data.communityID}`)}></div>
            <span className={styles.communityThumbTitle} onClick={() => page.router.push(`/communities/${data.communityID}`)}>{data.displayName}</span>
            <span className={styles.communityThumbDesc}>{Helpers.textLimiter(data.description, 180)}</span>
            <span className={styles.communityThumbStat}>
                <span>{data.memberCount}</span> Member{data.memberCount > 1 ? "s" : ""}
                <br />
                <span>{data.echoCount}</span> {data.echoCount > 1 ? "Echoes" : "Echo"}
            </span>
            { communityData.userMember ? <span className={styles.communityThumbJoin} onClick={() => handleClickButton()}>View Community</span> : null }
            { 
                !communityData.userMember ?
                    applied ? 
                    <span className={styles.communityThumbJoin} style={{backgroundColor: "var(--base)", color: "var(--primary)"}}>Applied</span> :
                    <span className={styles.communityThumbJoin} onClick={() => handleClickButton(data)}>{communityData.entryApproval ? "Apply to Join" : `Join Community`}</span>
                : null
            }
        </div>
    )
}