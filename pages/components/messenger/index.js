import React, { useEffect, useState } from "react";
import styles from "./messenger.module.css"

import DateGenerator from "../../../services/generators/DateGenerator";
import SVGServer from "../../../services/svg/svgServer";
import Helpers from "../../../util/Helpers";
import APIClient from "../../../services/APIClient";
import PusherClient from "../../../services/PusherClient";

export default function Messenger({ toggle, control, page }) {
    const [userChats, setUserChats] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchChats, setSearchChats] = useState([])
    const [chatPage, setChatPage] = useState(1)
    const [chatsLoader, setChatsLoader] = useState(true)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })

    useEffect(() => {
        const updateChat = (data) => {
            setUserChats((state) => [data, ...(state.filter((chat) => chat.chatID !== data.chatID))])
        }
        
        PusherClient.subscribe(page.activeUser.accountID).bind(`UPDATED_CHAT_LIST`, (data) => { updateChat(data) });
    }, [])

    useEffect(() => {
        const updateChats = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setUserChats, data.pagination, "chatID")
                setPagination(data.pagination)
            } else page.createAlert("error", data.message)
            setChatsLoader(false)
        }
        APIClient.get(APIClient.routes.getChats, { 
            accountID: page.activeUser.accountID,
            page: chatPage,
            pageSize: 10
        }, updateChats)
    }, [chatPage])

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchChats([])
            return;
        }
        if (searchQuery.length % 2 === 0) {
            setChatsLoader(true)
            const getSearchChats = (data) => {
                if (data.success) {
                    setSearchChats(data.data)
                } else page.createAlert("error", data.message)
                setChatsLoader(false)
            }
            APIClient.get(APIClient.routes.searchChats, { 
                accountID: page.activeUser.accountID,
                filter: searchQuery,
                page: 1,
                pageSize: 10
            }, getSearchChats)
        }
    }, [searchQuery])

    const blockUser = async (accountID) => {
        if (accountID !== userData.accountID) {
            APIClient.post(APIClient.routes.createBlacklist, {
                accountID: page.activeUser.accountID,
                blocker: page.activeUser.accountID,
                blockee: accountID,
                blockeeType: "user"
            })
            page.createAlert("success", "User blocked successfully.")
            setUserData({ ...userData, userBlocked: true })
        }
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && chatPage < pagination.totalPages && !chatsLoader) {
          setChatPage(chatPage + 1);
          setChatsLoader(true)
        }
    };

    return (
        <>
            <div className="modalOverlay" style={{ display: toggle ? "block" : "none" }} onClick={() => control(false)}></div>
            <div className={styles.messenger} style={{ right: !toggle ? "-700px" : null }} onScroll={handleScroll}>
                <div className={styles.messengerHead}>
                    <span className={styles.messengerTitle}>
                        <span className="titleGradient">Messages</span>
                    </span>
                    <span className={styles.messengerTitleIcon} style={{ transform: "scale(1.5,1.5)" }} onClick={() => control(false)}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
                    {/* <span className={styles.messengerTitleIcon} onClick={() => setShowSearch(true)}><SVGServer.SearchIcon color="var(--primary)" width="30px" height="30px" /></span> */}
                </div>

                <input type="text" className={styles.messengerSearch} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search friends..." />

                {/* <div className={styles.messengerChatRecents}>
                    <div className={styles.messengerChatRecent} onClick={() => page.setActiveChat(testChat)}>
                        <div style={{backgroundImage: `url(/images/bckg1.jpg)`}}></div>
                        <span>{Helpers.textLimiter("Veronica", 10)}</span>
                    </div>
                    <div className={styles.messengerChatRecent} onClick={() => page.setActiveChat(testChat)}>
                        <div style={{backgroundImage: `url(/images/bckg1.jpg)`}}></div>
                        <span>{Helpers.textLimiter("Halo", 10)}</span>
                    </div>
                    <div className={styles.messengerChatRecent} onClick={() => page.setActiveChat(testChat)}>
                        <div style={{backgroundImage: `url(/images/bckg1.jpg)`}}></div>
                        <span>{Helpers.textLimiter("Joshua", 10)}</span>
                    </div>
                </div> */}

                <div className={styles.messengerChats}>
                    {
                        searchQuery.length > 1 ?
                        searchChats && searchChats.length > 0 ?
                            searchChats.map((chat, index) => 
                                <div className={styles.messengerChat} key={index}>
                                    <div className={styles.messengerChatProfile}  onClick={() => page.router.push(`/user/${chat.target.accountID}`)} style={{backgroundImage: `url(${chat.target.profileImage.url})`}}></div>
                                    <div className={styles.messengerChatData} onClick={() => page.setActiveChat(chat)}>
                                        <span className={styles.messengerChatDataName}>
                                            {Helpers.textLimiter(chat.target.firstName, 12)}
                                            <span className={styles.messengerChatDataTime}><span></span>{DateGenerator.GenerateDateTime(chat.lastUpdated)}</span>
                                        </span>
                                        { chat.latestMessage ? 
                                            chat.latestMessage.text ?
                                            <span className={styles.messengerChatDataText}>{ chat.unread > 0 ? <span className={styles.messengerChatUnread}>{chat.unread}</span> : null }{Helpers.textLimiter(chat.latestMessage.text, 40)}</span> 
                                            : <span className={styles.messengerChatDataText}>{ chat.unread > 0 ? <span className={styles.messengerChatUnread}>{chat.unread}</span> : null }<SVGServer.CameraIcon color="var(--primary)" width="10px" height="10px" /></span> 
                                            : <span className={styles.messengerChatDataText}>Say Hi to {chat.target.firstName}!</span> 
                                        }
                                    </div>
                                    <div className={styles.messengerChatOptions}>
                                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                                        <div className={styles.messengerChatOptionBox}>
                                            <span className={styles.messengerChatOption}>Mute</span>
                                            <span className={styles.messengerChatOption}>Block</span>
                                        </div>
                                    </div>
                                </div>
                            )
                            : chatsLoader ? null : <span className={styles.messengerChatNotFound}>No results found.</span>
                        :
                        userChats && userChats.length > 0 ?
                        userChats.map((chat, index) =>
                            <div className={styles.messengerChat} key={index}>
                                <div className={styles.messengerChatProfile}  onClick={() => page.router.push(`/user/${chat.target.accountID}`)} style={{backgroundImage: `url(${chat.target.profileImage.url})`}}></div>
                                <div className={styles.messengerChatData} onClick={() => page.setActiveChat(chat)}>
                                    <span className={styles.messengerChatDataName}>
                                        {chat.target.firstName} {chat.target.lastName}
                                        <span className={styles.messengerChatDataTime}><span></span>{DateGenerator.GenerateDateTime(chat.lastUpdated)}</span>
                                    </span>
                                    { chat.latestMessage ? 
                                        chat.latestMessage.text ?
                                        <span className={styles.messengerChatDataText}>{ chat.unread > 0 ? <span className={styles.messengerChatUnread}>{chat.unread}</span> : null }{Helpers.textLimiter(chat.latestMessage.text, 40)}</span> 
                                        : <span className={styles.messengerChatDataText}>{ chat.unread > 0 ? <span className={styles.messengerChatUnread}>{chat.unread}</span> : null }<SVGServer.CameraIcon color="var(--primary)" width="10px" height="10px" /></span> 
                                        : <span className={styles.messengerChatDataText}>Say Hi to {chat.target.firstName}!</span> 
                                    }
                                </div>
                                <div className={styles.messengerChatOptions}>
                                    <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                                    <div className={styles.messengerChatOptionBox}>
                                        <span className={styles.messengerChatOption}>Mute</span>
                                        <span className={styles.messengerChatOption}>Block</span>
                                    </div>
                                </div>
                            </div>
                        )
                        : null
                    }
                    { chatsLoader ? 
                        <div className="loader" style={{
                            width: "50px",
                            height: "50px",
                            borderWidth: "5px",
                            borderColor: "var(--primary) transparent",
                            margin: "50px calc(50% - 25px) 0px calc(50% - 25px)"
                        }}></div>  : null
                    }
                </div>
            </div>
        </>
    )
}