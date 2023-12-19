import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateLogin(data) {
    if (!data.email || !ParamValidator.isValidEmail(data.email)) throw new Error("Missing or Invalid: email.")
    if (!data.password || data.password.length < 8) throw new Error("Missing or invalid password!")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function Login (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "email",
        "password"
    ], request.body);

    try {
        ValidateLogin(params);
        const newToken = IDGenerator.GenerateAccessToken()

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
                lastLogin: Date.now(),
                lastActive: Date.now(),
                userStatus: userAccount.userStatus,
                isVerified: userAccount.isVerified,
                settings: userSettings,
                dark: userSettings.dark,
                accessToken: newToken
            },
            message: "Login successful."
        })

        await db.collection("accounts").updateOne({ accountID: userAccount.accountID }, { $set: { 
            lastActive: Date.now(), 
            lastLogin: Date.now(),
            access: {
                token: newToken,
                expiration: Date.now()
            }
        } })

        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}