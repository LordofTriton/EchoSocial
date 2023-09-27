function getFileType(url) {
    const formatMatch = url.match(/\.(\w+)$/);
    if (formatMatch) {
        const fileFormat = formatMatch[1].toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileFormat)) return 'image';
        else if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(fileFormat)) return 'video';
    }
    return 'unknown'; // File format not recognized as an image or video
}

function textLimiter(text, limit, fullText) {
    if (text.length > limit && !fullText) return text.slice(0, limit).trim() + "..."
    else return text;
}

function clearUserData() {
    localStorage.removeItem("EchoActiveUser")
    localStorage.removeItem("EchoFeedEchoFeed")
    localStorage.removeItem("EchoMessengerFriends")
    localStorage.removeItem("EchoRecentCommunities")
}

function setPaginatedState(data, setState, pagination, identifier, concat=true) {
    setState((state) => {
        let updatedState = state;
        if (concat) {
            for (let i = 0; i < data.length; i++) {
                if (updatedState.find((item) => item[identifier] === (data[i])[identifier])) continue;
                updatedState[((pagination.page - 1) * pagination.pageSize) + i] = data[i]
            }
        } else {
            const filteredData = data.filter((item) => !updatedState.map((obj) => obj[identifier]).includes(item[identifier]))
            updatedState = [...filteredData, ...updatedState]
        }
        return updatedState;
    })
}

const Helpers = {
    getFileType,
    textLimiter,
    clearUserData,
    setPaginatedState
}

export default Helpers;