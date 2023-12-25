import axios from "axios"
import CacheService from "./CacheService";
import AppConfig from "../util/config";

function getToken() {
    const token = CacheService.getData("EchoUserToken");
    return token ? token : null;
}

async function post(url, data, callback, headers) {
    const response = await axios.post(`${AppConfig.HOST}/api${url}`, data, {
        headers: {
            ...headers,
            Authorization: `Bearer ${getToken()}`
        }
    })
    if (callback) callback(response.data);
    return response;
}

async function put(url, data, callback, headers) {
    const response = await axios.put(`${AppConfig.HOST}/api${url}`, data, {
        headers: {
            ...headers,
            Authorization: `Bearer ${getToken()}`
        }
    })
    if (callback) callback(response.data)
    return response;
}

async function get(url, data, callback, headers, noCache) {
    const query = Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');

    if (!noCache) {
        const cachedResponse = CacheService.getData(`${AppConfig.HOST}/api${url}?${query}`)
        if (cachedResponse && callback) callback(JSON.parse(cachedResponse))
    }

    const response = await axios.get(`${AppConfig.HOST}/api${url}?${query}`, {
        headers: {
            ...headers,
            Authorization: `Bearer ${getToken()}`
        }
    })

    if (!noCache) CacheService.saveData(`${AppConfig.HOST}/api${url}?${query}`, JSON.stringify(response.data))
    if (callback) callback(response.data)
    return response;
}

async function del(url, data, callback, headers) {
    const query = Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    const response = await axios.delete(`${AppConfig.HOST}/api${url}?${query}`, {
        headers: {
            ...headers,
            Authorization: `Bearer ${getToken()}`
        }
    })
    if (callback) callback(response.data)
    return response;
}

const APIClient = {
    post, 
    put, 
    get, 
    del,
    routes: {
        createAccount: "/accounts/create-account",
        deleteAccount: "/accounts/delete-account",
        getAccount: "/accounts/get-account",
        getAccounts: "/accounts/get-accounts",
        pingAccount: "/accounts/ping-account",
        updateAccount: "/accounts/update-account",

        changePassword: "/auth/change-password",
        login: "/auth/login",

        createBlacklist: "/blacklist/create-blacklist",
        deleteBlacklist: "/blacklist/delete-blacklist",
        getBlacklist: "/blacklist/get-blacklist",

        deleteFile: "/cloud/delete",
        uploadFile: "/cloud/upload",

        createComment: "/comments/create-comment",
        deleteComment: "/comments/delete-comment",
        getComment: "/comments/get-comment",
        getComments: "/comments/get-comments",
        pingComment: "/comments/ping-comment",
        updateComment: "/comments/update-comment",
        
        createCommunity: "/communities/create-community",
        deleteCommunity: "/communities/delete-community",
        getCommunity: "/communities/get-community",
        getCommunities: "/communities/get-communities",
        updateCommunity: "/communities/update-community",

        createCommunityApplication: "/community-applications/create-community-application",
        deleteCommunityApplication: "/community-applications/delete-community-application",
        getCommunityApplications: "/community-applications/get-community-applications",
        pingCommunityApplication: "/community-applications/ping-community-application",
        updateCommunityApplication: "/community-applications/update-community-application",

        createCommunityMember: "/community-members/create-community-member",
        deleteCommunityMember: "/community-members/delete-community-member",
        getCommunityMember: "/community-members/get-community-member",
        getCommunityMembers: "/community-members/get-community-members",
        banCommunityMember: "/community-members/ban-community-member",
        updateCommunityMember: "/community-members/update-community-member",

        createEcho: "/echoes/create-echo",
        deleteEcho: "/echoes/delete-echo",
        getEcho: "/echoes/get-echo",
        getEchoes: "/echoes/get-echoes",
        pingEcho: "/echoes/ping-echo",
        updateEcho: "/echoes/update-echo",
        
        getFeed: "/feed/get-feed",
        getCommunityFeed: "/feed/get-community-feed",
        getCommunitiesFeed: "/feed/get-communities-feed",
        getuserFeed: "/feed/get-user-feed",

        createFriend: "/friends/create-friend",
        deleteFriend: "/friends/delete-friend",
        getFriend: "/friends/get-friend",
        getFriends: "/friends/get-friends",
        updateFriend: "/friends/update-friend",

        createHeart: "/hearts/create-heart",
        deleteHeart: "/hearts/delete-heart",
        getHeart: "/hearts/get-heart",
        getHearts: "/hearts/get-hearts",
        updateHeart: "/hearts/update-heart",

        createChat: "/messenger/create-chat",
        createMessage: "/messenger/create-message",
        deleteChat: "/messenger/delete-chat",
        getChat: "/messenger/get-chat",
        getChats: "/messenger/get-chats",
        getMessages: "/messenger/get-messages",
        searchChats: "/messenger/search-chats",
        updateChat: "/messenger/update-chat",
        updateMessage: "/messenger/update-message",

        createNode: "/nodes/create-node",
        deleteNode: "/nodes/delete-node",
        getNodes: "/nodes/get-nodes",
        pingNode: "/nodes/ping-node",

        createNotification: "/notifications/create-notification",
        deleteNotification: "/notifications/delete-notification",
        getNotifications: "/notifications/get-notifications",
        updateNotification: "/notifications/update-notification",

        createSave: "/saves/create-save",
        deleteSave: "/saves/delete-save",
        getSaves: "/saves/get-saves",
        updateSave: "/saves/update-save",

        createSettings: "/settings/create-settings",
        deleteSettings: "/settings/delete-settings",
        getSettings: "/settings/get-settings",
        updateSettings: "/settings/update-settings"
    }
}

export default APIClient;