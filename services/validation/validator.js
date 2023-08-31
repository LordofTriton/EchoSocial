function isValidAccountID(accountID) {
    return accountID && accountID.length > 5;
}

function isValidObjectID(id) {
    return id && id.length > 5;
}

function isValidEmail(email) {
    return email && email.length > 5;
}

function isValidGender(gender) {
    const validGenders = ["Male", "Female", "Non Binary", "None"]
    return validGenders.includes(gender)
}

function isValidMaritalStatus(maritalStatus) {
    const validMaritalStatuses = ["Single", "Married", "Divorced", "It's Complicated"]
    return validMaritalStatuses.includes(maritalStatus)
}

function isValidUserStatus(userStatus) {
    const validuserStatuses = ["active", "deactivated", "suspended"]
    return validuserStatuses.includes(userStatus)
}

function isValidNotificationStatus(status) {
    const validNotificationStatuses = ["read", "unread"]
    return validNotificationStatuses.includes(status)
}

function isValidAudience(audience) {
    const validScopes = ["public", "community", "friends", "private"]
    return validScopes.includes(audience)
}

function isValidPhone(phone) {
    return true;
}

function isValidActiveStatus(status) {
    const validActiveStatuses = ["online", "offline", "away"]
    return validActiveStatuses.includes(status)
}

function isValidCommunityStatus(status) {
    const validCommunityStatuses = ["active", "inactive"]
    return validCommunityStatuses.includes(status)
}

function isValidCommunityPrivacy(privacy) {
    const validCommunityPrivacy = ["public", "private"]
    return validCommunityPrivacy.includes(privacy)
}

function isValidMemberStatus(status) {
    const validMemberStatuses = ["active", "inactive"]
    return validMemberStatuses.includes(status)
}

function isValidMemberRole(role) {
    const validMemberRoles = ["admin", "moderator", "member"]
    return validMemberRoles.includes(role)
}

const ParamValidator = {
    isValidEmail,
    isValidGender,
    isValidMaritalStatus,
    isValidNotificationStatus,
    isValidObjectID,
    isValidAudience,
    isValidAccountID,
    isValidUserStatus,
    isValidPhone,
    isValidActiveStatus,
    isValidCommunityPrivacy,
    isValidCommunityStatus,
    isValidMemberStatus,
    isValidMemberRole
}

export default ParamValidator;