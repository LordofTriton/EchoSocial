import { useState } from "react";

function useDataStates() {
    const [feed, updateFeed] = useState(JSON.parse(localStorage.getItem("EchoFeed")) || [])
    const [communitiesFeed, updateCommunitiesFeed] = useState(JSON.parse(localStorage.getItem("EchoCommunitiesFeed")) || [])
    const [messengerFriends, updateMessengerFriends] = useState(JSON.parse(localStorage.getItem("EchoMessengerFriends")) || [])
    const [recentCommunities, updateRecentCommunities] = useState(JSON.parse(localStorage.getItem("EchoRecentCommunities")) || [])
    const [galleryCommunities, updateGalleryCommunities] = useState(JSON.parse(localStorage.getItem("EchoGalleryCommunities")) || [])
    const [discoverCommunities, updateDiscoverCommunities] = useState(JSON.parse(localStorage.getItem("EchoDiscoverCommunities")) || [])
    const [strangerPeople, updateStrangerPeople] = useState(JSON.parse(localStorage.getItem("EchoStrangerPeople")) || [])
    const [friendPeople, updateFriendPeople] = useState(JSON.parse(localStorage.getItem("EchoFriendPeople")) || [])
    const [chats, updateChats] = useState(JSON.parse(localStorage.getItem("EchoChats")) || [])

    const setFeed = (data) => {
        localStorage.setItem("EchoFeed", JSON.stringify(data))
        updateFeed(data)
    }
    
    const setCommunitiesFeed = (data) => {
        localStorage.setItem("EchoCommunitiesFeed", JSON.stringify(data))
        updateCommunitiesFeed(data)
    }

    const setMessengerFriends = (data) => {
        localStorage.setItem("EchoMessengerFriends", JSON.stringify(data))
        updateMessengerFriends(data)
    }

    const setRecentCommunities = (data) => {
        localStorage.setItem("EchoRecentCommunities", JSON.stringify(data))
        updateRecentCommunities(data)
    }

    const setGalleryCommunities = (data) => {
        localStorage.setItem("EchoGalleryCommunities", JSON.stringify(data))
        updateGalleryCommunities(data)
    }

    const setDiscoverCommunities = (data) => {
        localStorage.setItem("EchoDiscoverCommunities", JSON.stringify(data))
        updateDiscoverCommunities(data)
    }

    const setStrangerPeople = (data) => {
        localStorage.setItem("EchoStrangerPeople", JSON.stringify(data))
        updateStrangerPeople(data)
    }

    const setFriendPeople = (data) => {
        localStorage.setItem("EchoFriendPeople", JSON.stringify(data))
        updateFriendPeople(data)
    }

    const setChats = (data) => {
        localStorage.setItem("EchoChats", JSON.stringify(data))
        updateChats(data)
    }

    const clearCache = () => {
        localStorage.clear()
    }

    const userData = (accountID) => {
        const data = localStorage.getItem(`EchoUser${accountID}`)
        return data ? JSON.parse(data) : null;
    }

    const setUserData = (data) => {
        if (!data || !data.accountID) return;
        localStorage.setItem(`EchoUser${data.accountID}`, JSON.stringify(data))
    }

    const communityData = (communityID) => {
        const data = localStorage.getItem(`EchoCommunity${communityID}`)
        return data ? JSON.parse(data) : null;
    }

    const setCommunityData = (data) => {
        if (!data || !data.communityID) return;
        localStorage.setItem(`EchoCommunity${data.communityID}`, JSON.stringify(data))
    }

    const userFeed = (accountID) => {
        const data = localStorage.getItem(`EchoUserFeed${accountID}`)
        return data ? JSON.parse(data) : [];
    }

    const setUserFeed = (accountID, feed) => {
        if (!accountID || feed.length < 1) return;
        localStorage.setItem(`EchoUserFeed${accountID}`, JSON.stringify(feed))
    }

    const communityFeed = (communityID) => {
        const data = localStorage.getItem(`EchoCommunityFeed${communityID}`)
        return data ? JSON.parse(data) : [];
    }

    const setCommunityFeed = (communityID, feed) => {
        if (!communityID || feed.length < 1) return;
        localStorage.setItem(`EchoCommunityFeed${communityID}`, JSON.stringify(feed))
    }

    const chatMessages = (chatID) => {
        const data = localStorage.getItem(`EchoChatMessages${chatID}`)
        return data ? JSON.parse(data) : [];
    }

    const setChatMessages = (chatID, messages) => {
        if (!chatID || messages.length < 1) return;
        localStorage.setItem(`EchoChatMessages${chatID}`, JSON.stringify(messages))
    }

    const dataStates = { userData, communityData, feed, userFeed, communityFeed, messengerFriends, recentCommunities, communitiesFeed, galleryCommunities, discoverCommunities, strangerPeople, friendPeople, chats, chatMessages }
    const dataControl = { clearCache, setUserData, setCommunityData, setFeed, setUserFeed, setCommunityFeed, setMessengerFriends, setRecentCommunities, setCommunitiesFeed, setGalleryCommunities, setDiscoverCommunities, setStrangerPeople, setFriendPeople, setChats, setChatMessages }

    return { dataStates, dataControl }
}

export default useDataStates;