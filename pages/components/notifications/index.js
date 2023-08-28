import React, { useEffect, useState } from "react";
import styles from "./notifications.module.css"

import APIClient from "../../../services/APIClient";
import SVGServer from "../../../services/svg/svgServer";
import DateGenerator from "../../../services/generators/DateGenerator";
import Helpers from "../../../util/Helpers";

export default function Notifications({toggle, control, page}) {
    const [notifications, setNotifications] = useState([])
    const [notificationPage, setNotificationPage] = useState(1)
    const [getNotificationsLoader, setNotificationsLoader] = useState(true)
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })

    useEffect(() => {
        if (!page.socket) return;
        const updateNotifications = (data) => { setNotifications((state) => [data, ...state]) }
        page.socketMethods.socketListener("NEW_NOTIFICATION", updateNotifications)
    }, [page.socket]);

    useEffect(() => {
        if (page.socket) {
            const updateNotifications = (data) => {
                if (data.success) {
                    setNotifications((state) => state.concat(data.data))
                    setPagination(data.pagination)
                }
                setNotificationsLoader(false)
            }
            page.socketMethods.socketRequest("GET_NOTIFICATIONS", { 
                accountID: page.activeUser.accountID,
                page: notificationPage,
                pageSize: 10
            }, updateNotifications)
        }
    }, [page.socket, notificationPage])

    const filterNotifications = async (status) => {
        setNotificationPage(1)
        const updateNotifications = (data) => {
            if (data.success) {
                setNotifications(data.data)
                setPagination(data.pagination)
            }
            setNotificationsLoader(false)
        }
        if (page.socket) page.socketMethods.socketRequest("GET_NOTIFICATIONS", { 
            accountID: page.activeUser.accountID,
            page: 1,
            pageSize: 10,
            status
        }, updateNotifications)
    }

    const deleteNotification = async (notificationID) => {
        setNotifications(notifications.filter((notification) => notification.notificationID !== notificationID))
        if (page.socket) page.socketMethods.socketEmitter("DELETE_NOTIFICATION", { 
            accountID: page.activeUser.accountID,
            notificationID
        })
    }

    const readNotification = async (notificationID) => {
        const item = notifications.find((notification) => notification.notificationID === notificationID)
        if (page.socket) page.socketMethods.socketEmitter("UPDATE_NOTIFICATION", { 
            accountID: page.activeUser.accountID,
            notificationID,
            status: "read"
        })
        setNotifications(notifications.map((notification) => notification.notificationID !== notificationID ? notification : {...notification, status: "read"}))
        if (item.clickable) page.router.push(item.redirect)
    }

    const readAllNotifications = async () => {
        setNotifications(notifications.map((notification) => {return {...notification, status: "read"}}))
        if (page.socket) page.socketMethods.socketEmitter("UPDATE_NOTIFICATION", { 
            accountID: page.activeUser.accountID,
            status: "read"
        })
    }

    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
        if (isAtBottom && notificationPage < pagination.totalPages && !getNotificationsLoader) {
          setNotificationPage(notificationPage + 1);
          setNotificationsLoader(true)
        }
    };

    return (
        <>
        <div className="modalOverlay" style={{display: toggle ? "block" : "none"}} onClick={() => control(false)}></div>
        <div className={styles.notificationsContainer} style={{right: toggle ? "70px" : "-500px"}} onScroll={handleScroll}>
            <div className={styles.notificationsContainerHead}>
                <span className={styles.notificationsContainerTitle}>Notifications</span>
                <span className={styles.notificationsContainerClose} onClick={() => control(false)} style={{ transform: "scale(1.3,1.3)" }}><SVGServer.CloseIcon color="var(--primary)" width="30px" height="30px" /></span>
            </div>
            <div className={styles.notificationsContainerButtons}>
                <span className={styles.notificationsContainerFilter} onClick={() => filterNotifications(null)}>All</span>
                <span className={styles.notificationsContainerFilter} onClick={() => filterNotifications("unread")}>Unread</span>
                <span className={styles.notificationsContainerMarkAll} onClick={() => readAllNotifications()}>Mark All As Read</span>
            </div>
            <div className={styles.notificationsBox}>
                {
                    notifications.length > 0 ?
                    notifications.map((notification, index) => 
                        <div key={index} className={styles.notificationsBoxEntry} style={{backgroundColor: "var(--surface)", opacity: notification.status === "unread" ? "1" : "0.6"}}>
                            <div className={styles.notificationsBoxEntryImage} style={{backgroundImage: `url(${notification.image})`}} />
                            <div className={styles.notificationsBoxEntryContent} onClick={() => readNotification(notification.notificationID)}>
                                <span className={styles.notificationsBoxEntryContentText} style={{color: "var(--primary)"}}>{Helpers.textLimiter(notification.content, 180)}</span>
                                <span className={styles.notificationsBoxEntryContentTime}>{DateGenerator.GenerateTimePassed(notification.datetime)}</span>
                            </div>
                            <span className={styles.notificationsBoxEntryClose} onClick={() => deleteNotification(notification.notificationID)}>
                                <SVGServer.DeleteIcon color="var(--secondary)" width="20px" height="20px" />
                            </span>
                        </div>
                    )
                    : <span className={styles.nullNotifications}>You have no notifications right now.</span>
                }
            </div>
        </div>
        </>
    )
}