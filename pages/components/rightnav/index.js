import React, {useEffect, useState} from "react";
import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import styles from "./rightnav.module.css"

export default function RightNav({ page }) {
    const [userFriends, setUserFriends] = useState([])

    useEffect(() => {
        if (page.socket) {
            const updateUserFriends = (data) => data.success ? setUserFriends(data.data) : null;
            if (page.socket) page.socketMethods.socketRequest("GET_FRIENDS", { accountID: page.activeUser.accountID, userID: page.activeUser.accountID }, updateUserFriends)
        }
    }, [page.socket])

    return (
        <div className={styles.rightnavContainer}>
            <div className={styles.rightnavChatBox}>
                {
                    userFriends.length > 0 ?
                    userFriends.slice(0, 11).map((friend, index) => 
                    <div key={index} className={styles.rightnavChatBoxChat} style={{backgroundImage: `url(${friend.profileImage.url})`}}>
                        <span></span>
                    </div>
                    ) : null
                }
                {
                    Array.from({ length: Math.max(0, 7 - userFriends.length) }, (_, index) => index).map((obj) =>
                        <div className={styles.rightnavChatBoxChat}></div>
                    )
                }
            </div>
            <div className={styles.rightnavButton} onClick={() => page.setShowMessenger(true)}>
                <span>
                    <SVGServer.MessagesIcon color="var(--base)" width="40px" height="40px" />
                </span>
            </div>
        </div>
    )
}