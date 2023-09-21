import { useEffect, useState } from 'react';

function useModalStates() {
    const [showNotificationDot, setShowNotificationDot] = useState(false)
    const [showEchoViewer, updateShowEchoViewer] = useState(false)
    const [showEchoCreator, updateShowEchoCreator] = useState(false)
    const [showMediaViewer, updateShowMediaViewer] = useState(false)
    const [showNotifications, updateShowNotifications] = useState(false)
    const [showNodeCreator, updateShowNodeCreator] = useState(false)
    const [showCommunityCreator, updateShowCommunityCreator] = useState(false)
    const [showMessenger, updateShowMessenger] = useState(false)
    const [activeChat, updateActiveChat] = useState(null)
    const [showChat, updateShowChat] = useState(false)
    const [showSearch, updateShowSearch] = useState(false)

    const setShowSearch = (data) => {
        updateShowSearch(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
        }
    }

    const setShowEchoViewer = (data) => {
        updateShowEchoViewer(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
        }
    }

    const setShowEchoCreator = (data) => {
        updateShowEchoCreator(data)
        if (data) {
            setShowNotifications(false)
        }
    }

    const setShowMediaViewer = (data) => {
        updateShowMediaViewer(data)
        if (data) {
            
        }
    }

    const setShowNotifications = (data) => {
        updateShowNotifications(data)
        if (data) {
            updateShowEchoCreator(false)
        }
    }

    const setShowNodeCreator = (data) => {
        updateShowNodeCreator(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
        }
    }

    const setShowCommunityCreator = (data) => {
        updateShowCommunityCreator(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
        }
    }

    const setShowChat = (data) => {
        updateShowChat(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
        }
    }

    const setActiveChat = (data) => {
        updateActiveChat(data)
        updateShowChat(true)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
            setShowMessenger(false)
        }
    }

    const setShowMessenger = (data) => {
        updateShowMessenger(data)
        if (data) {
            updateShowEchoCreator(false)
            setShowNotifications(false)
            setShowChat(false)
        }
    }

    const modalStates = {showNotificationDot, showEchoViewer, showEchoCreator, showMediaViewer, showNotifications, showNodeCreator, showCommunityCreator, activeChat, showMessenger, showChat, showSearch}
    const modalControl = {setShowNotificationDot, setShowEchoViewer, setShowEchoCreator, setShowMediaViewer, setShowNotifications, setShowNodeCreator, setShowCommunityCreator, setActiveChat, setShowMessenger, setShowChat, setShowSearch}

    return { modalStates, modalControl };
}

export default useModalStates;