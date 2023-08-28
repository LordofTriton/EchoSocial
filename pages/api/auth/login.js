import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateLogin(data) {
    if (!data.email || !ParamValidator.isValidEmail(data.email)) throw new Error("Missing or Invalid: email.")
    if (!data.password || data.password.length < 8) throw new Error("Missing or invalid password!")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async (request, response) => {
    let io = response.socket.server.io;
    let params = parseParams([
        "email",
        "password"
    ], request.body);

    try {
        ValidateLogin(params);

        const userAccount = await db.collection("accounts").findOne({ email: params.email, password: params.password })
        if (!userAccount) throw new Error("Incorrect email or password!")
        const userSettings = await db.collection("settings").findOne({ accountID: userAccount.accountID })
        let heartCount = await db.collection("hearts").countDocuments({ userID: userAccount.accountID });

        const responseData = ResponseClient.GenericSuccess({
            data: {
                accountID: userAccount.accountID,
                firstName: userAccount.firstName,
                lastName: userAccount.lastName,
                nickname: userAccount.nickname,
                email: userAccount.email,
                profileImage: userAccount.profileImage,
                gender: userAccount.gender,
                phone: userAccount.phone,
                nodes: userAccount.nodes,
                hearts: heartCount ? heartCount : 0,
                dateOfBirth: userAccount.dateOfBirth,
                location: userAccount.location,
                emailConfirmed: userAccount.emailConfirmed,
                phoneNumberConfirmed: userAccount.phoneNumberConfirmed,
                resonance: userAccount.resonance,
                userRole: userAccount.userRole,
                lastLogin: userAccount.lastLogin,
                lastActive: userAccount.lastActive,
                userStatus: userAccount.userStatus,
                isVerified: userAccount.isVerified,
                dark: userSettings.dark
            },
            message: "Login successful."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}