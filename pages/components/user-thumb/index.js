import React, { useEffect, useState } from "react";
import styles from "./user-thumb.module.css"

import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import APIClient from "../../../services/APIClient";

export default function UserThumb({ data, page }) {
    const [userData, setUserData] = useState(data)

    const handleClickLikeButton = async () => {
        if (userData.userLiked) setUserData({ ...userData, userLiked: false, userFriend: false })
        else setUserData({ ...userData, userLiked: true, userFriend: userData.userLikee ? true : false })
    
        if (page.activeUser.accountID !== userData.accountID) page.socketMethods.socketEmitter(userData.userLiked ? "DELETE_HEART" : "CREATE_HEART", {
          accountID: page.activeUser.accountID,
          userID: userData.accountID
        })
    }

    return (
        <div className={styles.userThumb}>
            <div className={styles.userThumbCover} style={{backgroundImage: `url(${userData.profileCover.url})`}}></div>
            <div className={styles.userThumbProfile} style={{backgroundImage: `url(${userData.profileImage.url})`}} onClick={() => page.router.push(`/user/${userData.accountID}`)}></div>
            <span className={styles.userThumbTitle} onClick={() => page.router.push(`/user/${userData.accountID}`)}>{userData.firstName} {userData.lastName}</span>
            <span className={styles.userThumbDesc}>{userData.nickname}</span>

            {
                userData && userData.accountID !== page.activeUser.accountID ?
                <div className={styles.userThumbLikeButton} onClick={() => handleClickLikeButton()}>
                    {
                        userData && userData.userLiked ?
                        <SVGServer.HeartFilledIcon color="var(--surface)" width="20px" height="20px" /> :
                        <SVGServer.HeartLineIcon color="var(--surface)" width="20px" height="20px" />
                    }
                </div> : null
            }
            {
                userData && userData.userFriend ?
                <div className={styles.userThumbChatButton} onClick={() => null}>
                    <SVGServer.MessagesIcon color="var(--surface)" width="20px" height="20px" />
                </div> : null
            }
        </div>
    )
}