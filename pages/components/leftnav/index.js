import React, { useEffect, useState } from "react";
import AppConfig from "../../../util/config";
import styles from "./leftnav.module.css"
import SVGServer from "../../../services/svg/svgServer";
import Helpers from "../../../util/Helpers";
import APIClient from "../../../services/APIClient";

export default function LeftNav({ page }) {
    const [userCommunities, setUserCommunities] = useState([])
    const [communityLoader, setCommunityLoader] = useState(true)

    useEffect(() => {
        const updateUserCommunities = (data) => {
            if (data.success) {
                setUserCommunities(data.data)
            } else page.createAlert("error", data.message)
            setCommunityLoader(false)
        }
        if (page.activeUser) {
            APIClient.get(APIClient.routes.getCommunities, {
                accountID: page.activeUser.accountID,
                userID: page.activeUser.accountID,
                member: true,
                page: 1,
                pageSize: 4
            }, updateUserCommunities)
        }
    }, [page.activeUser])

    return (
        <div className={styles.leftnavContainer}>
            <div className={styles.leftnavContainerHead}>
                <img src={`/images/newLogoTransparent.png`} alt="logo" onClick={() => page.router.push("/")} />
            </div>
            <div className={styles.leftnavMenuButton} onClick={() => page.router.push("/")} style={{color: page.title === "Feed" ? "var(--accent)" : null}}>
                <SVGServer.FeedIcon color="currentColor" width="40px" height="40px" />
                <div className={styles.leftnavMenuButtonLabel}>
                    <span>Feed</span>
                </div>
            </div>
            <div className={styles.leftnavMenuButton} onClick={() => page.router.push("/communities")} style={{color: page.title === "Communities" ? "var(--accent)" : null}}>
                <SVGServer.CommunityIcon color="currentColor" width="40px" height="40px" />
                <div className={styles.leftnavMenuButtonLabel}>
                    <span>Communities</span>
                </div>
            </div>
            <div className={styles.leftnavMenuButton} onClick={() => page.router.push("/people")} style={{color: page.title === "People" ? "var(--accent)" : null}}>
                <SVGServer.PeopleIcon color="currentColor" width="40px" height="40px" />
                <div className={styles.leftnavMenuButtonLabel}>
                    <span>People</span>
                </div>
            </div>
            <hr style={{margin: "30px 20px", borderBottom: "2px solid var(--alt)"}} />
            {
                userCommunities && userCommunities.length ?
                    userCommunities.map((community, index) => 
                        <div key={index} className={styles.leftnavCommunityButton}>
                            <div className={styles.leftnavCommunityButtonProfile} style={{backgroundImage: `url(${community.profileImage.url})`}} onClick={() => page.router.push(`/communities/${community.communityID}`)}>
                                <div className={styles.leftnavMenuButtonLabel}>
                                    <span>{Helpers.textLimiter(community.displayName, 20)}</span>
                                </div>
                            </div>
                        </div>
                    )
                : <>
                    { communityLoader ? 
                        <div className="loader" style={{
                            width: "30px",
                            height: "30px",
                            borderWidth: "4px",
                            borderColor: "var(--primary) transparent",
                            margin: "0px calc(50% - 15px) 0px calc(50% - 15px)"
                            }}></div>  : null
                    }</>
            }
        </div>
    )
}