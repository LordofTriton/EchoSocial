import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidateChangePassword(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.oldPassword || data.oldPassword.length < 8) throw new Error("Missing or invalid old password!")
    if (!data.newPassword || data.newPassword.length < 8) throw new Error("Missing or invalid new password!")
    if (!data.confirmNewPassword || data.confirmNewPassword.length < 8) throw new Error("Missing or invalid confirm new password!")
    if (data.newPassword !== data.confirmNewPassword) throw new Error("Passwords do not match!")
}

function parseParams(data) {
    const { accountID, echoID, content, repliedTo } = data;
    return { accountID, echoID, content, repliedTo };
}

export default async function ChangePassword(params, io) {
    const { db } = await getDB();
    params = {
        accountID: request.body.accountID,
        oldPassword: request.body.oldPassword,
        newPassword: request.body.newPassword,
        confirmNewPassword: request.body.confirmNewPassword
    }

    try {
        ValidateChangePassword(params);

        const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID, password: params.oldPassword })
        if (!userAccount) throw new Error("Incorrect email or password!")

        const updatedPassword = await db.collection("accounts").findOneAndUpdate({ accountID: params.accountID }, {$set: {password: params.newPassword}})

        const responseData = ResponseClient.GenericSuccess({
            data: updatedPassword,
            message: "Login successful."
        })

        await CreateNotification({
            accountID: userAccount.accountID,
            content: `Your password was changed.`,
            image: userAccount.profileImage.url,
            clickable: false,
            redirect: `${AppConfig.HOST}/settings`
        }, io)

        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}