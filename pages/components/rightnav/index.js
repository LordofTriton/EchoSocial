import pusherJs from "pusher-js";
import React, {useEffect, useState} from "react";
import APIClient from "../../../services/APIClient";
import PusherClient from "../../../services/PusherClient";
import SVGServer from "../../../services/svg/svgServer";
import Helpers from "../../../util/Helpers";
import styles from "./rightnav.module.css"

function Friend({data, page}) {
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        if (data && data.userChat && data.userChat.unread > 0) {
            setShowPreview(true)
            setTimeout(() => setShowPreview(false), 3000)
        }
    }, [data])

    const getChat = (friend) => {
        return {
            ...friend.userChat,
            origin: {
                accountID: page.activeUser.accountID,
                firstName: page.activeUser.firstName,
                lastName: page.activeUser.lastName,
                profileImage: page.activeUser.profileImage
            },
            target: {
                accountID: friend.accountID,
                firstName: friend.firstName,
                lastName: friend.lastName,
                profileImage: friend.profileImage,
                lastActive: friend.lastActive
            },
            userFriend: true
        }
    }

    return (
        <div className={styles.rightnavChatBoxChat} style={{backgroundImage: `url(${data.profileImage.url})`}} onClick={() => getChat(data) ? page.setActiveChat(getChat(data)) : null}>
            {
                getChat(data).unread > 0 ?
                <span className={styles.rightnavChatBoxChatUnread}>{getChat(data).unread}</span> :
                <span className={styles.rightnavChatBoxChatOnline} style={{backgroundColor: data.active ? "lime" : "dimgray"}}></span>
            }
            <div className={styles.rightnavChatBoxChatPreview} style={{width: showPreview && getChat(data).unread > 0 ? "200px" : "0px"}}>
                <span className={styles.rightnavChatBoxChatPreviewName}>{getChat(data).target.firstName}</span>
                { getChat(data).latestMessage && getChat(data).latestMessage.text ? <span className={styles.rightnavChatBoxChatPreviewContent}>{Helpers.textLimiter(getChat(data).latestMessage.text, 30)}</span> : null }
            </div>
        </div>
    )
}

export default function RightNav({ page }) {
    const [userFriends, setUserFriends] = useState([])

    useEffect(() => {
        const updateUserFriends = (data) => {
            if (data.success) {
                setUserFriends(data.data);
            } else page.createAlert("error", data.message)
        }
        APIClient.get(APIClient.routes.getFriends, { 
            accountID: page.activeUser.accountID, 
            userID: page.activeUser.accountID,
            page: 1,
            pageSize: 7
        }, updateUserFriends)
    }, [])

    useEffect(() => {
        const updateFriends = (data) => {
            setUserFriends((state) => state.concat(data))
        }
        
        PusherClient.subscribe(page.activeUser.accountID).bind(`NEW_FRIEND`, (data) => { updateFriends(data) });
    }, [])

    useEffect(() => {
        const updateChat = (data) => {
            setUserFriends((state) => {
                const update = state.map((friend) => {
                    if (!friend.userChat) return;
                    if (page.activeChat && friend.userChat.chatID === page.activeChat.chatID) return {...friend, userChat: { ...friend.userChat, unread: 0 }};
                    if (friend.accountID === data.target.accountID) return {...friend, userChat: data}
                    else return friend;
                })
                return update;
            })
        }
        
        PusherClient.subscribe(page.activeUser.accountID).bind(`UPDATED_CHAT_LIST`, (data) => { updateChat(data) });
    }, [])

    const getChat = (friend) => {
        return {
            ...friend.userChat,
            origin: {
                accountID: page.activeUser.accountID,
                firstName: page.activeUser.firstName,
                lastName: page.activeUser.lastName,
                profileImage: page.activeUser.profileImage
            },
            target: {
                accountID: friend.accountID,
                firstName: friend.firstName,
                lastName: friend.lastName,
                profileImage: friend.profileImage
            },
            userFriend: true
        }
    }

    return (
        <div className={styles.rightnavContainer}>
            <div className={styles.rightnavChatBox}>
                {
                    userFriends.length > 0 ?
                    userFriends.slice(0, 7).map((friend, index) => 
                        <Friend data={friend} page={page} key={index} />
                    ) : null
                }
                {
                    Array.from({ length: Math.max(0, 7 - userFriends.length) }, (_, index) => index).map((obj, index) =>
                        <div className={styles.rightnavChatBoxChat} key={index}></div>
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