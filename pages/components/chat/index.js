import React, { useEffect, useRef, useState } from "react";
import styles from "./chat.module.css"

import DateGenerator from "../../../services/generators/DateGenerator";
import SVGServer from "../../../services/svg/svgServer";
import APIClient from "../../../services/APIClient";
import Helpers from "../../../util/Helpers";
import PusherClient from "../../../services/PusherClient";

function Message({ chatData, messageData, page, key, index, methods }) {

    const isUserMessage = () => {
        return messageData.accountID === page.activeUser.accountID;
    }

    const getBorderRadius = () => {
        let result = ""
        if (methods.serieStart(index)) result = isUserMessage() ? "20px 20px 5px 20px" : "20px 20px 20px 5px"
        else if (methods.serieMid(index)) result = isUserMessage() ? "20px 5px 5px 20px" : "5px 20px 20px 5px"
        else if (methods.serieEnd(index)) result = isUserMessage() ? "20px 5px 20px 20px" : "5px 20px 20px 20px"
        else if (!methods.serieStart(index) && !methods.serieMid(index) && !methods.serieEnd(index)) result = "20px"
        return result;
    }

    const getProfileAlign = () => {
        if (isUserMessage()) return { right: "0px" }
        else return { left: "0px" }
    }

    return (
        <div className={styles.chatMessage} style={{marginBottom: methods.serieStart(index) || methods.serieMid(index) ? "5px" : null, padding: isUserMessage() ? "0px 42px 0px 0px" : "0px 0px 0px 42px"}}>
            <div className={styles.chatMessageProfile} style={{backgroundImage: `url(${isUserMessage() ? chatData.origin.profileImage.url : chatData.target.profileImage.url})`, display: methods.serieStart(index) || methods.serieMid(index) ? "none" : "block", ...getProfileAlign() }}></div>
            {
                messageData.repliedTo ?
                <div className={styles.chatMessageReply}>
                    <div className={styles.chatMessageReplyBody} style={{float: isUserMessage() ? "right" : "left", borderRadius: isUserMessage() ? "20px 20px 5px 20px" : "20px 20px 20px 5px", backgroundColor: messageData.content.media ? "transparent" : isUserMessage() ? "var(--surface)" : "var(--primary)"}}>
                        <span className={styles.chatMessageReplyBodyTip} style={{borderRadius: getBorderRadius()}}>
                            <span><SVGServer.ReplyIcon color="var(--primary)" width="10px" height="10px" /></span>{isUserMessage() ? "You" : chatData.target.firstName} replied to { messageData.repliedTo.accountID === page.activeUser.accountID ? isUserMessage() ? "yourself" : "you" : chatData.target.firstName }
                        </span>
                        { messageData.repliedTo.media ? <img className={styles.chatMessageImage} src={messageData.repliedTo.media.url} alt="image_msg" style={{maxWidth: "150px", borderRadius: isUserMessage() ? "20px 20px 5px 20px" : "20px 20px 20px 5px"}} /> : null }
                        { messageData.repliedTo.text ? <pre className={styles.chatMessageReplyText} style={{color: isUserMessage() ? "var(--primary)" : "var(--surface)"}}>{Helpers.textLimiter(messageData.repliedTo.text, 180)}</pre> : null}
                    </div>
                </div>
                : null
            }
            {
                messageData.deleted ?
                <div className={styles.chatMessageBody} style={{borderRadius: getBorderRadius(), float: isUserMessage() ? "right" : "left", backgroundColor: "transparent", border: isUserMessage() ? "2px solid var(--primary)" : "2px solid var(--surface)"}}>
                    <pre className={styles.chatMessageText} style={{color: isUserMessage() ? "var(--primary)" : "var(--surface)"}}>This message was deleted.</pre>
                </div> :
                <div className={styles.chatMessageBody} style={{borderRadius: getBorderRadius(), float: isUserMessage() ? "right" : "left", backgroundColor: messageData.content.media ? "transparent" : isUserMessage() ? "var(--primary)" : "var(--surface)"}}>
                    { 
                        messageData.content.media ? 
                        messageData.pending ?
                        <>
                        <div className={styles.chatMessageLoader}><div className="loader" style={{
                            width: "15%",
                            aspectRatio: 1,
                            borderWidth: "1%",
                            borderColor: "var(--alt) transparent",
                            float: "right",
                            margin: "10px 10px"
                        }}></div></div>
                        { messageData.content.media.type.startsWith('image/') ? <img className={styles.chatMessageImage} src={URL.createObjectURL(messageData.content.media)} alt="image_msg" style={{borderRadius: getBorderRadius()}} /> : null }
                        { messageData.content.media.type.startsWith('video/') ? <video className={styles.chatMessageImage} src={URL.createObjectURL(messageData.content.media)} style={{borderRadius: getBorderRadius()}} /> : null }
                                            
                        {/* { Helpers.getFileType(messageData.content.media.url) === "image" ? <img className={styles.chatMessageImage} src={messageData.content.media.url} alt="image_msg" style={{borderRadius: getBorderRadius()}} /> : null }
                        { Helpers.getFileType(messageData.content.media.url) === "video" ? <video className={styles.chatMessageImage} src={messageData.content.media.url} style={{borderRadius: getBorderRadius()}} /> : null } */}
                        </>
                        :
                        <>
                        { Helpers.getFileType(messageData.content.media.url) === "image" ? <img className={styles.chatMessageImage} src={messageData.content.media.url} alt="image_msg" style={{borderRadius: getBorderRadius()}} /> : null }
                        { Helpers.getFileType(messageData.content.media.url) === "video" ? <video className={styles.chatMessageImage} src={messageData.content.media.url} style={{borderRadius: getBorderRadius()}} /> : null }
                        </>
                        : null 
                    }
                    { messageData.content.text ? <pre className={styles.chatMessageText} style={{color: isUserMessage() ? "var(--surface)" : "var(--primary)"}}>{messageData.content.text}</pre> : null }
                </div>
            }
            {
                messageData.pending ? null : <>
                <span className={styles.chatMessageButton} style={{float: isUserMessage() ? "right" : "left", margin: isUserMessage() ? "0px 10px 0px 0px" : "0px 0px 0px 10px", backgroundColor: isUserMessage() ? "var(--surface)" : "var(--primary)"}} onClick={() => methods.setNewMessageReply({ accountID: messageData.accountID, text: messageData.content.text, media: messageData.content.media })}>
                    <SVGServer.ReplyIcon color={isUserMessage() ? "var(--alt)" : "var(--surface)"} width="20px" height="20px" />
                </span>
                {
                    isUserMessage() ?
                        <span className={styles.chatMessageButton} style={{float: isUserMessage() ? "right" : "left", margin: isUserMessage() ? "0px 10px 0px 0px" : "0px 0px 0px 10px", backgroundColor: isUserMessage() ? "var(--surface)" : "var(--primary)"}} onClick={() => methods.deleteMessage(messageData.messageID)}>
                            <SVGServer.DeleteIcon color={isUserMessage() ? "var(--alt)" : "var(--surface)"} width="20px" height="20px" />
                        </span>
                    : null
                } </>
            }
        </div>
    )
}

export default function Chat({ toggle, data, page }) {
    const chatBodyRef = useRef(null);
    const [chatData, setChatData] = useState(data)
    const [chatMessages, setChatMessages] = useState([])
    const [scrollChat, setScrollChat] = useState(false)
    const [newMessageText, setNewMessageText] = useState("")
    const [newMessageMedia, setNewMessageMedia] = useState([])
    const [newMessageReply, setNewMessageReply] = useState(null)
    const [messagePage, setMessagePage] = useState(1)
    const [messageLoader, setMessageLoader] = useState(true)
    const [messageEditorLoader, setMessageEditorLoader] = useState(false)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })

    const updateMessage = (data) => {
        setChatMessages((state) => {
            const update = state.map((message) => {
                if (message.messageID === data.messageID) return data;
                else return message;
            })
            return update;
        })
    }
    const updateChat = (data) => setChatData(data)
    const updateMessages = (data) => {
        setChatMessages((state) => {
            const update = state.filter((message) => message.messageID !== data.messageID).concat(data)
            return update;
        }) 
    }

    useEffect(() => {
        if (data) {
            setChatData(data)
            APIClient.post(APIClient.routes.updateChat, {
                accountID: page.activeUser.accountID,
                chatID: data.chatID,
                unread: 0
            })
        }
        setChatMessages([])
        setNewMessageText("")
        setNewMessageMedia([])
        setNewMessageReply(null)
        setMessagePage(1)
        setMessageLoader(true)
    }, [data])

    useEffect(() => {
        if (!chatData) return;
        const channel = PusherClient.subscribe(page.activeUser.accountID)
        channel.bind(`UPDATED_CHAT_${chatData.chatID}`, function(data) {
            updateChat(data)
        });
    }, [chatData])

    useEffect(() => {
        if (!chatData) return;
        const channel = PusherClient.subscribe(page.activeUser.accountID)
        channel.bind(`UPDATED_MESSAGE_${chatData.chatID}`, function(data) {
            updateMessage(data)
        });
    }, [chatData])

    useEffect(() => {
        if (!chatData) return;
        const channel = PusherClient.subscribe(page.activeUser.accountID)
        channel.bind(`NEW_MESSAGE_${chatData.chatID}`, function(data) {
            updateMessage(data)
        });
    }, [chatData])

    useEffect(() => {
        if (!data) return;
        const updateMessages = (data) => {
            if (data.success) {
                Helpers.setPaginatedState(data.data, setChatMessages, data.pagination, "messageID", false)
                setPagination(data.pagination)
                if (messagePage === 1) setScrollChat(true)
            }
            setMessageLoader(false)
        }
        if (data) APIClient.get(APIClient.routes.getMessages, { 
            accountID: page.activeUser.accountID,
            chatID: data.chatID,
            page: messagePage,
            pageSize: 10
        }, updateMessages)
    }, [data, messagePage])

    useEffect(() => {
        if (toggle && chatData && chatMessages.length > 0) {
            APIClient.post(APIClient.routes.updateChat, {
                accountID: page.activeUser.accountID,
                chatID: data.chatID,
                unread: 0
            })
        }
    }, [toggle])

    useEffect(() => {
        const scrollChatToBottom = () => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
            setScrollChat(false)
        };
        // scrollChatToBottom()
        // const scrollChatToBottom = () => {
        //     let chatBody = document.getElementById("chatBody")
        //     if (chatBody) chatBody.scrollTo({top: chatBody.scrollHeight, left: 0, behavior: 'smooth'})
        //     setScrollChat(false)
        // }
        if (scrollChat) scrollChatToBottom()
    }, [scrollChat])

    const handleFileSelect = (event) => {
        const files = event.target.files;
        if (!files) return;
        const fileList = Array.from(files);

        setNewMessageMedia(fileList);
    };

    const handleSubmit = async () => {
        const content = {
            text: newMessageText,
            media: newMessageMedia,
            reply: newMessageReply
        }
        setNewMessageText("")
        setNewMessageReply(null)
        setNewMessageMedia([])

        if (content.media.length > 0) {
            for (let file of content.media) {
                createMediaMessage(file, content.reply)
            }
        }
        if (newMessageText) createTextMessage(content.text, content.reply)
    }

    const createTextMessage = async (text, reply) => {
        const newTextMessage = {
            messageID: Date.now(),
            accountID: page.activeUser.accountID,
            chatID: chatData.chatID,
            content: {
                text: text,
                media: null
            },
            repliedTo: reply ? reply : null,
            pending: true
        }
        setChatMessages(chatMessages.concat(newTextMessage))
        setScrollChat(true)
        const createdTextMessage = (data) => {
            if (data.success) {
                setChatMessages(chatMessages.filter((message) => message.messageID !== newTextMessage.messageID).concat(data.data))
            }
        }
        APIClient.post(APIClient.routes.createMessage, newTextMessage, createdTextMessage)
    }

    const createMediaMessage = async (file, reply) => {
        const newMediaMessage = {
            messageID: Date.now(),
            accountID: page.activeUser.accountID,
            chatID: chatData.chatID,
            content: {
                text: null,
                media: file
            },
            repliedTo: reply ? reply : null,
            pending: true
        }
        setChatMessages(chatMessages.concat(newMediaMessage))
        setScrollChat(true)

        const formData = new FormData();
        formData.append(`media`, file)
        const uploadedFile = (await APIClient.post(APIClient.routes.uploadFile, formData, null, { 'Content-Type': "multipart/form-data" })).data;
        if (!uploadedFile.success) {
            page.createAlert({ type: "error", message: uploadedFile.message })
            return;
        }

        const createdMediaMessage = (data) => {
            page.createAlert(data.success ? "success" : "error", data.message)
            if (data.success) {
                setChatMessages(chatMessages.filter((message) => message.messageID !== newMediaMessage.messageID).concat(data.data))
            }
        }
        APIClient.post(APIClient.routes.createMessage, {
            accountID: page.activeUser.accountID,
            chatID: chatData.chatID,
            content: {
                text: null,
                media: uploadedFile ? uploadedFile.data[0] : null
            },
            repliedTo: reply ? reply : null
        }, createdMediaMessage)
    }

    const deleteMessage = async (messageID) => {
        APIClient.post(APIClient.routes.updateMessage, {
            accountID: page.activeUser.accountID,
            messageID,
            deleted: true
        })
        setChatMessages(chatMessages.map((message) => {
            if (message.messageID === messageID) return { ...message, deleted: true }
            else return message;
        }))
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        const isAtTop = scrollTop === 0;
    
        if (isAtTop && messagePage < pagination.totalPages && !messageLoader) {
          setMessagePage(messagePage + 1);
          setMessageLoader(true)
        }
    };

    const serieStart = (index) => {
        if (chatMessages.length < 1) return false;
        const prev = chatMessages[index - 1]
        const curr = chatMessages[index];
        const next = chatMessages[index + 1]

        return (!prev || prev.accountID !== curr.accountID) && (next && next.accountID === curr.accountID && next.repliedTo === null) ? true : false
    }

    const serieMid = (index) => {
        if (chatMessages.length < 1) return false;
        const prev = chatMessages[index - 1]
        const curr = chatMessages[index];
        const next = chatMessages[index + 1]

        return (prev && prev.accountID === curr.accountID) && (next && next.accountID === curr.accountID && next.repliedTo === null) ? true : false
    }

    const serieEnd = (index) => {
        if (chatMessages.length < 1) return false;
        const prev = chatMessages[index - 1]
        const curr = chatMessages[index];
        const next = chatMessages[index + 1]

        return (prev && prev.accountID === curr.accountID) && curr.repliedTo === null && (!next || next.accountID !== curr.accountID || next.repliedTo !== null) ? true : false
    }

    const autoExpandArea = (target) => {
        if (target.value !== "") {
            target.style.height = "50px"; // Reset the height to auto to calculate the new height
            target.style.height = target.scrollHeight + "px"; // Set the height to match the content
        } else target.style.height = "50px"
    };

    return (
        <>
            <div className="modalOverlay" style={{ display: toggle ? "block" : "none" }} onClick={() => page.setShowChat(false)}></div>
            <div className={styles.chat} style={{ right: !toggle ? "-700px" : null }}>
                <div className={styles.chatHead}>
                    <span className={styles.chatNavArrow} onClick={() => { page.setShowChat(false); page.setShowMessenger(true); }}><SVGServer.ArrowRight color="var(--primary)" width="30px" height="40px" /></span>
                    <div className={styles.chatUserProfile} style={{backgroundImage: chatData ? `url(${chatData.target.profileImage.url})` : null}} onClick={() => page.router.push(`/user/${chatData.target.accountID}`)}></div>
                    <div className={styles.chatUserData} onClick={() => page.router.push(`/user/${chatData.target.accountID}`)}>
                        <span className={styles.chatUserName}>{chatData ? `${chatData.target.firstName} ${chatData.target.lastName}` : " "}</span>
                        <span className={styles.chatUserTime}>active {chatData ? DateGenerator.GenerateDateTime(chatData.target.lastActive) : null}</span>
                    </div>
                    <div className={styles.chatHeadOptions}>
                        <SVGServer.OptionIcon color="var(--primary)" width="30px" height="30px" />
                        <div className={styles.chatHeadOptionsBox}>
                            <span className={styles.chatHeadOption}>Mute</span>
                        </div>
                    </div>
                </div>

                <div className={styles.chatBody} id="chatBody" ref={chatBodyRef} onScroll={handleScroll}>
                    <div className={styles.chatMessages}>
                        { messageLoader ? 
                            <div className="loader" style={{
                                width: "50px",
                                height: "50px",
                                borderWidth: "5px",
                                borderColor: "var(--primary) transparent",
                                margin: "0px calc(50% - 25px) 0px calc(50% - 25px)"
                            }}></div>  : null
                        }
                        {
                            page.activeChat && chatMessages && chatMessages.length ?
                                chatMessages.map((message, index) =>
                                    <>
                                        { index === 0 || DateGenerator.hoursBetween(message.datetime, chatMessages[index - 1].datetime) > 2 ? <span className={styles.chatMessagesTimeDivider}>{ DateGenerator.GenerateDateTime(message.datetime) }</span> : null }
                                        <Message chatData={data} messageData={message} page={page} key={index} index={index} methods={{
                                            serieStart,
                                            serieMid,
                                            serieEnd,
                                            setNewMessageReply,
                                            deleteMessage
                                        }} />
                                    </>
                                ) : null
                        }
                    </div>
                </div>

                {
                    chatData && chatData.userFriend ?
                    <div className={styles.chatFooter}>
                        {
                            newMessageReply ?
                            <div className={styles.chatFooterReply}>
                                <span className={styles.chatFooterReplyTitle}>Replying to { newMessageReply.accountID === page.activeUser.accountID ? "yourself" : chatData.target.firstName }</span>
                                { newMessageReply.text ? <span className={styles.chatFooterReplyText}>{newMessageReply.text}</span> : null }
                                { newMessageReply.media ? <img className={styles.chatFooterReplyImage} src={newMessageReply.media.url} alt="media" /> : null }
                                
                                <span className={styles.chatFooterReplyClose} onClick={() => setNewMessageReply(null)}>
                                    <SVGServer.CloseIcon color="var(--accent)" width="30px" height="30px" />
                                </span>
                            </div>
                            : null
                        }
                        {
                            newMessageMedia.length > 0 ?
                            <div className={styles.chatFooterMediaGallery}>
                                {
                                    newMessageMedia.map((media) => 
                                        <>
                                        { media.type.startsWith('image/') ? <img className={styles.chatFooterMedia} src={URL.createObjectURL(media)} alt="media" /> : null }
                                        { media.type.startsWith('video/') ? <video className={styles.chatFooterMedia} src={URL.createObjectURL(media)} controls /> : null }
                                        </>
                                    )
                                }
                            </div>
                            : null
                        }
                        <div className={styles.chatInput}>
                            <>
                            <label htmlFor="mediaSelector" className={styles.chatInputImage}><SVGServer.CameraIcon color="var(--primary)" width="26px" height="26px" /></label>
                            <input type="file" id="mediaSelector" accept="image/*" onChange={(e) => handleFileSelect(e)} style={{ display: "none" }} multiple />
                            </>
                            <textarea className={styles.chatInputField} type="text" placeholder="Message" onChange={(e) => { setNewMessageText(e.target.value); autoExpandArea(e.target) }} value={newMessageText}></textarea>
                            <span className={styles.chatInputSubmit} onClick={() => handleSubmit()}><SVGServer.SendIcon color="var(--primary)" width="30px" height="30px" /></span>
                        </div>
                    </div>
                    : <span className={styles.chatBlock}>You cannot send messages to this user.</span>
                }
            </div>
        </>
    )
}