import React, { useEffect, useState } from "react";
import styles from "./messenger.module.css"

import DateGenerator from "../../../services/generators/DateGenerator";
import SVGServer from "../../../services/svg/svgServer";
import Echo from "../echo";
import EchoComment from "../echo-comment";
import APIClient from "../../../services/APIClient";
import ScrollTrigger from "../scroll-trigger";
import Helpers from "../../../util/Helpers";

function Message({ data, page }) {

    const isUserMessage = () => {
        return data.accountID === page.activeUser.accountID;
    }

    const participantName = (accountID) => {
        if (accountID === page.activeUser.accountID) return "You"
        else return page.activeChat.participants.find((participant) => participant.accountID === accountID).name;
    }

    return (
        <div className={styles.messengerChatMessage}>
            <div className={styles.messengerChatMessageBody} style={{float: isUserMessage() ? "right" : "left"}}>
                <div className={styles.messengerChatMessageData} style={{backgroundColor: isUserMessage() ? "var(--accent)" : "var(--base)", borderRadius: isUserMessage() ? "15px 15px 5px 15px" : "15px 15px 15px 5px"}}>
                    <div className={styles.messengerChatMessageBodyContent}>
                        {
                            data.content.media ?
                                <div className={styles.messengerChatMessageBodyContentMedia}>
                                    {Helpers.getFileType(data.content.media) === "image" ? <img className={styles.messengerChatMessageBodyContentMediaImage} src={data.content.media} /> : null}
                                    {Helpers.getFileType(data.content.media) === "unknown" ? <div className={styles.messengerChatMessageBodyContentMediaUnknown}><span>Unknown File Type</span></div> : null}
                                </div> : null
                        }
                        {
                            data.repliedTo ?
                                <div className={styles.messengerChatMessageBodyContentReply}>
                                    {data.repliedTo.media ? <div className={styles.messengerChatMessageBodyContentReplyMedia} style={{ backgroundImage: `url(${data.repliedTo.media})` }}></div> : null}
                                    <div className={styles.messengerChatMessageBodyContentReplyBody}>
                                        <span className={styles.messengerChatMessageBodyHead}>{participantName(data.repliedTo.accountID)}<span>{DateGenerator.GenerateDateTime(data.repliedTo.datetime)}</span></span>
                                        <div className={styles.messengerChatMessageBodyContentReplyBodyContent}>{data.repliedTo.text ? <pre className={styles.messengerChatMessageReplyBodyContentText} style={{color: isUserMessage() ? "var(--surface)" : "var(--primary)"}}>{data.repliedTo.text}</pre> : null}</div>
                                    </div>
                                </div> : null
                        }
                        { data.content.text ? <pre className={styles.messengerChatMessageBodyContentText} style={{color: isUserMessage() ? "var(--surface)" : "var(--primary)"}}>{data.content.text}</pre> : null }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Messenger({ toggle, control, page }) {
    const [userChats, setUserChats] = useState([])
    const [newMessageMedia, setNewMessageMedia] = useState(null)

    useEffect(() => {
        if (!page.socket) return;
        page.socket.on('new_message', (data) => {
            const parsedData = JSON.parse(data.message)
            setUserChats([parsedData, ...userNotifications])
        });
    }, [page.socket]);

    useEffect(() => {
        if (!toggle) page.setActiveChat(null)
    }, [toggle])

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setNewMessageMedia(file);
    };

    const createMessage = async () => {
        let uploadedFile;
        if (newCommentMedia) {
            const formData = new FormData();
            formData.append(`media`, newCommentMedia)
            uploadedFile = (await APIClient.post("/cloud/upload", formData, { 'Content-Type': "multipart/form-data" })).data;
            if (!uploadedFile.success) {
                createAlert({ type: "error", message: uploadedFile.message })
                return;
            }
        }

        const response = (await APIClient.post("/comments/create-comment", {
            echoID: echoData.echoID,
            accountID: page.activeUser.accountID,
            content: {
                text: newCommentText ? newCommentText : null,
                media: uploadedFile ? uploadedFile.data[0].url : null,
                link: null
            },
            datetime: Date.now(),
            hearts: [page.activeUser.accountID],
            repliedTo: newCommentReply ? newCommentReply : null
        })).data;
        page.createAlert(response.success ? "success" : "error", response.message)
        if (response.success) {
            setEchoNewComments(echoNewComments.concat(response.data))
        }
        setShowCommentEditor(false)
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

        if (isAtBottom) {
            if (Math.ceil(echoData.comments / 10) > commentPage) setCommentPage(commentPage + 1);
        }
    };

    const testChat = {
        chatID: "1",
        participants: [
            { accountID: "1234567", name: "Halo McGee" },
            { accountID: "7654321", name: "Agboola Joshua" }
        ],
        history: [
            {
                messageID: "11",
                accountID: "1234567",
                content: {
                    text: "Hello!",
                    media: null,
                    link: null
                },
                datetime: Date.now(),
                repliedTo: null
            },
            {
                messageID: "11",
                accountID: "1234567",
                content: {
                    text: "Hi! How are you doing?",
                    media: null,
                    link: null
                },
                datetime: Date.now(),
                repliedTo: {
                    text: "Hello!",
                    media: null,
                    link: null
                }
            }
        ]
    }

    const testMessages = [
        {
            chatID: "1234567",
            accountID: page.activeUser.accountID,
            content: {
                text: "Hello!",
                media: null,
                link: null
            },
            datetime: Date.now(),
            repliedTo: null
        },
        {
            chatID: "1234567",
            accountID: "7654321",
            content: {
                text: "What's up?",
                media: null,
                link: null
            },
            datetime: Date.now(),
            repliedTo: {
                accountID: page.activeUser.accountID,
                text: "Hello!",
                media: null,
                link: null
            }
        },
        {
            chatID: "1234567",
            accountID: page.activeUser.accountID,
            content: {
                text: "I'm good!",
                media: "http://localhost:3000/images/bckg1.jpg",
                link: null
            },
            datetime: Date.now(),
            repliedTo: null
        },
        {
            chatID: "1234567",
            accountID: "7654321",
            content: {
                text: "What's the image for?",
                media: null,
                link: null
            },
            datetime: Date.now(),
            repliedTo: {
                accountID: page.activeUser.accountID,
                text: "I'm good!",
                media: "http://localhost:3000/images/bckg1.jpg",
                link: null
            }
        },
    ]

    return (
        <>
            <div className="modalOverlay" style={{ display: toggle ? "block" : "none" }} onClick={() => control(false)}></div>
            <div className={styles.messengerChat} style={{ right: page.activeChat ? "570px" : "-500px" }}>
                <div className={styles.messengerChatHead}>
                    <span className={styles.messengerChatClose}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
                    <span className={styles.messengerChatUserData}>
                        <span className={styles.messengerChatUserProfile}></span>
                        <span className={styles.messengerChatUserName}>Halo</span>
                    </span>
                </div>

                <div className={styles.messengerChatMessages}>
                    {
                        testMessages && testMessages.length ?
                            testMessages.map((message, index) =>
                                <Message data={message} page={page} key={index} />
                            ) : null
                    }
                </div>
            </div>
            <div className={styles.messengerChatList} style={{ right: toggle ? "70px" : "-500px" }} onScroll={handleScroll}>
                <div className={styles.messengerChatListHead}>
                    <span className={styles.messengerChatListTitle}>
                        Messages
                    </span>
                    <span className={styles.messengerChatListTitleIcon} style={{ transform: "scale(1.5,1.5)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
                    <span className={styles.messengerChatListTitleIcon}><SVGServer.SearchIcon color="var(--primary)" width="30px" height="30px" /></span>
                </div>

                <input type="text" className={styles.messengerChatListSearch} placeholder="Search chats and friends..." />

                <div className={styles.messengerChatListChat}>
                    <div className={styles.messengerChatListChatProfile}></div>
                    <div className={styles.messengerChatListChatData}>
                        <span className={styles.messengerChatListChatDataName}>Halo McGee</span>
                        <span className={styles.messengerChatListChatDataText}>{Helpers.textLimiter("Hi. I've been trying to reach you about your car's extended warranty...", 50)}</span>
                    </div>
                    <div className={styles.messengerChatListChatOptions}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        <div className={styles.messengerChatListChatOptionBox}>
                            <span className={styles.messengerChatListChatOption}>Mute</span>
                            <span className={styles.messengerChatListChatOption}>Delete</span>
                            <span className={styles.messengerChatListChatOption}>Block</span>
                            <span className={styles.messengerChatListChatOption}>Report</span>
                        </div>
                    </div>
                </div>
                <div className={styles.messengerChatListChat} onClick={() => page.setActiveChat(true)}>
                    <div className={styles.messengerChatListChatProfile}></div>
                    <div className={styles.messengerChatListChatData}>
                        <span className={styles.messengerChatListChatDataName}>Halo McGee</span>
                        <span className={styles.messengerChatListChatDataText}>{Helpers.textLimiter("Hi. I've been trying to reach you about your car's extended warranty...", 50)}</span>
                    </div>
                    <div className={styles.messengerChatListChatOptions}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        <div className={styles.messengerChatListChatOptionBox}>
                            <span className={styles.messengerChatListChatOption}>Mute</span>
                            <span className={styles.messengerChatListChatOption}>Delete</span>
                            <span className={styles.messengerChatListChatOption}>Block</span>
                            <span className={styles.messengerChatListChatOption}>Report</span>
                        </div>
                    </div>
                </div>
                <div className={styles.messengerChatListChat}>
                    <div className={styles.messengerChatListChatProfile}></div>
                    <div className={styles.messengerChatListChatData}>
                        <span className={styles.messengerChatListChatDataName}>Halo McGee</span>
                        <span className={styles.messengerChatListChatDataText}>{Helpers.textLimiter("Hi. I've been trying to reach you about your car's extended warranty...", 50)}</span>
                    </div>
                    <div className={styles.messengerChatListChatOptions}>
                        <SVGServer.OptionIcon color="var(--secondary)" width="25px" height="25px" />
                        <div className={styles.messengerChatListChatOptionBox}>
                            <span className={styles.messengerChatListChatOption}>Mute</span>
                            <span className={styles.messengerChatListChatOption}>Delete</span>
                            <span className={styles.messengerChatListChatOption}>Block</span>
                            <span className={styles.messengerChatListChatOption}>Report</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}