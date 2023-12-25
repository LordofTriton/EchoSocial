import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import TokenGenerator from "../../../services/generators/TokenGenerator";

import NickGenerator from "../../../services/generators/NIckGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateSettings from "../settings/create-settings";
import CreateMember from "../community-members/create-community-member";
import SendEmail from "../../../services/EmailService";

function ValidateCreateAccount(data) {
    if (!data.firstName || data.firstName.length < 2) throw new Error("Missing or Invalid: first name.")
    if (!data.lastName || data.lastName.length < 2) throw new Error("Missing or Invalid: last name.")
    if (!data.email || !ParamValidator.isValidEmail(data.email)) throw new Error("Missing or Invalid: email.")
    if (!data.password || data.password.length < 8) throw new Error("Missing or Invalid: password.")
    if (!data.confirmPassword || data.confirmPassword.length < 8) throw new Error("Missing or Invalid: confirm password.")
    if (data.password !== data.confirmPassword) throw new Error("Passwords do not match.")
}

export default async function CreateAccount (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "firstName", 
        "lastName", 
        "email", 
        "password", 
        "confirmPassword"
    ], request.body);

    try {
        ValidateCreateAccount(params)

        let userAccount = await db.collection("accounts").findOne({ email: params.email })
        if (userAccount) throw new Error("An account with this email already exists.")

        const accountData = {
            accountID: IDGenerator.GenerateAccountID(),
            firstName: params.firstName,
            lastName: params.lastName,
            nickname: NickGenerator(),
            email: params.email,
            profileImage: {
                publicID: null,
                url: `/images/userProfile.png`
            },
            profileCover: {
                publicID: null,
                url: `/images/bckg1.jpg`
            },
            bio: "",
            badges: [{
                badgeIcon: `/images/badges/joined.png`,
                name: "Joined"
            }],
            fSocial: "",
            tSocial: "",
            iSocial: "",
            gender: "None",
            phone: null,
            nodes: [],
            dateOfBirth: null,
            country: null,
            city: null,
            maritalStatus: null,
            occupation: null,
            emailConfirmed: false,
            phoneNumberConfirmed: false,
            userRole: "user",
            lastLogin: Date.now(),
            lastActive: Date.now(),
            dateCreated: Date.now(),
            password: params.password,
            userStatus: "active",
            isVerified: false,
            access: {
                token: TokenGenerator.GenerateAccessToken(),
                expiration: Date.now()
            }
        }

        const createAccountResponse = await db.collection("accounts").insertOne(accountData)
        if (createAccountResponse.errors) throw new Error("An error occured when creating account.");

        const responseData = ResponseClient.DBModifySuccess({
            data: {
                accountID: accountData.accountID,
                firstName: accountData.firstName,
                lastName: accountData.lastName,
                nickname: accountData.nickname,
                email: accountData.email,
                profileImage: accountData.profileImage,
                profileCover: accountData.profileCover,
                gender: accountData.gender,
                phone: accountData.phone,
                nodes: accountData.nodes,
                dateOfBirth: accountData.dateOfBirth,
                location: accountData.location,
                emailConfirmed: accountData.emailConfirmed,
                phoneNumberConfirmed: accountData.phoneNumberConfirmed,
                userRole: accountData.userRole,
                communities: [],
                lastLogin: accountData.lastLogin,
                lastActive: accountData.lastActive,
                userStatus: accountData.userStatus,
                isVerified: accountData.isVerified,
                accessToken: accountData.access.token
            },
            message: "Account created successfully."
        })
        
        response.json(responseData)

        response.once("finish", async () => {
            await SendEmail(params.email, "Welcome", "welcome", { firstName: params.firstName })
            
            await axios.post(AppConfig.HOST + "/api/settings/create-settings", { accountID: accountData.accountID })
            await axios.post(AppConfig.HOST + "/api/notification/create-notification", {
                accountID: accountData.accountID,
                content: `Hi, ${accountData.firstName}! Welcome to Echo. Click here to set up your profile.`,
                image: accountData.profileImage.url,
                clickable: true,
                redirect: `/settings`
            })
            await axios.post(AppConfig.HOST + "/api/community-members/create-community-member", {
                accountID: accountData.accountID,
                communityID: "64f1cfcbfb50625f2c96883c"
            })
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}