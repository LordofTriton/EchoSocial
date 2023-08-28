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

const Helpers = {
    getFileType,
    textLimiter
}

export default Helpers;