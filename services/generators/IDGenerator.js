import { ObjectId } from "mongodb"

function GenerateAccountID() {
    return String(new ObjectId())
}

function GenerateCommunityID() {
    return String(new ObjectId())
}

function GenerateNotificationID() {
    return String(new ObjectId())
}

function GenerateEchoID() {
    return String(new ObjectId())
}

function GenerateNodeID() {
    return String(new ObjectId())
}

function GenerateCommentID() {
    return String(new ObjectId())
}

function GenerateChatID() {
    return String(new ObjectId())
}

function GenerateHeartID() {
    return String(new ObjectId())
}

function GenerateApplicationID() {
    return String(new ObjectId())
}

function GenerateMemberID() {
    return String(new ObjectId())
}

function GenerateSaveID() {
    return String(new ObjectId())
}

function GenerateBlacklistID() {
    return String(new ObjectId())
}

function GenerateMessageID() {
    return String(new ObjectId())
}

const IDGenerator = {
    GenerateAccountID,
    GenerateCommunityID,
    GenerateEchoID,
    GenerateNotificationID,
    GenerateNodeID,
    GenerateCommentID,
    GenerateChatID,
    GenerateHeartID,
    GenerateMemberID,
    GenerateApplicationID,
    GenerateSaveID,
    GenerateBlacklistID,
    GenerateMessageID
}

export default IDGenerator;