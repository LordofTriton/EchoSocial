import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import AppConfig from "../../../util/config";

function ValidateUpdateAccount(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.firstName && data.firstName.length < 3) throw new Error("Invalid: first name.")
    if (data.lastName && data.lastName.length < 3) throw new Error("Invalid: last name.")
    if (data.email && !ParamValidator.isValidEmail(data.email)) throw new Error("Invalid: email.")
    if (data.profileImage && data.profileImage.url && data.profileImage.url.length < 5) throw new Error("Missing or Invalid: profile image.")
    if (data.profileCover && data.profileCover.url && data.profileCover.url.length < 5) throw new Error("Missing or Invalid: profile cover.")
    if (data.gender && !ParamValidator.isValidGender(data.gender)) throw new Error("Invalid: gender.")
    if (data.phone && !ParamValidator.isValidPhone(data.phone)) throw new Error("Invalid: phone.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
    if (data.dateOfBirth && data.dateOfBirth.length < 3) throw new Error("Invalid: date of birth.")
    if (data.location) {
        if (!data.location.country || data.location.country.length < 3) throw new Error("Invalid location country.")
        if (!data.location.state || data.location.state.length < 3) throw new Error("Invalid location state.")
        if (!data.location.city || data.location.city.length < 3) throw new Error("Invalid location city.")
    }
    if (data.maritalStatus && !ParamValidator.isValidMaritalStatus(data.maritalStatus)) throw new Error("Invalid: marital status.")
    if (data.occupation && data.occupation.length < 2) throw new Error("Missing or Invalid: occupation")
    if (data.lastActive && data.lastActive.length < 3) throw new Error("Missing or Invalid: last active.")
    if (data.userStatus && !ParamValidator.isValidUserStatus(data.userStatus)) throw new Error("Invalid: user status.")
}

async function UpdateAccount (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "firstName", 
        "lastName", 
        "nickname",
        "email", 
        "bio",
        "profileImage", 
        "profileCover",
        "gender",
        "phone",
        "nodes",
        "country",
        "city",
        "dateOfBirth",
        "maritalStatus",
        "occupation",
        "lastLogin",
        "lastActive",
        "userStatus",
        "fSocial",
        "tSocial",
        "iSocial"
    ], request.body);

    try {
        ValidateUpdateAccount(params);

        if (params.email) {
            const checkEmail = await db.collection("accounts").findOne({email: params.email})
            if (checkEmail && checkEmail.accountID !== params.accountID) throw new Error("User with this email already exists!")
        }

        const userAccount = await db.collection("accounts").findOneAndUpdate({ accountID: params.accountID }, {$set: params})
        if (!userAccount) throw new Error("Account does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: userAccount,
            message: "Account updated successfully."
        })
        response.json(responseData);
        
        response.once("finish", async () => {
            if (params.nodes) {
                for (let node of params.nodes) {
                    const accountNodeCount = await db.collection("accounts").countDocuments({ nodes: { $elemMatch: { nodeID: node.nodeID } } })
                    const communityNodeCount = await db.collection("communities").countDocuments({ nodes: { $elemMatch: { nodeID: node.nodeID } } })
                    await db.collection("nodes").findOneAndUpdate({ nodeID: node.nodeID }, { $set: { pings: accountNodeCount + communityNodeCount }})
                }
            }
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(UpdateAccount);