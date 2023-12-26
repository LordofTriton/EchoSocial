import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidateResetPassword(data) {
    if (!data.token || !ParamValidator.isValidObjectID(data.token)) throw new Error("Missing or Invalid: token.")
    if (!data.newPassword || data.newPassword.trim().length < 6) throw new Error("Missing or Invalid: new password!")
    if (data.newPassword !== data.confirmNewPassword) throw new Error("Passwords do not match!")
}

async function ResetPassword(request, response, authToken) {
    const { db } = await getDB();
    const params = {
        token: request.body.token,
        newPassword: request.body.newPassword,
        confirmNewPassword: request.body.confirmNewPassword
    }

    try {
        ValidateResetPassword(params);

        const userAccount = await db.collection("accounts").findOne({ resetToken: params.token })
        if (!userAccount) throw new Error("An error occurred please try again.")

        const updatedPassword = await db.collection("accounts").findOneAndUpdate({ resetToken: params.token }, {$set: {password: params.newPassword}})

        const responseData = ResponseClient.GenericSuccess({
            data: updatedPassword,
            message: "Password reset successfully."
        })

        response.json(responseData)

        response.once("finish", async () => {
            await axios.post(AppConfig.HOST + "/api/notifications/create-notification", {
                accountID: userAccount.accountID,
                content: `Your password was reset.`,
                image: userAccount.profileImage.url,
                clickable: false,
                redirect: ""
            })
        }, { headers: { Authorization: `Bearer ${userAccount.access.token}` } })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}

export default ResetPassword;