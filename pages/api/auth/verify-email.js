import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";
import SendEmail from "../../../services/EmailService";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateResetPassword(data) {
    if (!data.code || !ParamValidator.isValidObjectID(data.code)) throw new Error("Invalid verification code.")
}

async function VerifyEmail(request, response, authToken) {
    const { db } = await getDB();
    const params = {
        code: request.body.code
    }

    try {
        ValidateResetPassword(params);

        const userAccount = await db.collection("accounts").findOne({ emailVToken: params.code })
        if (!userAccount) throw new Error("Invalid verification code.")

        await db.collection("accounts").updateOne({ accountID: userAccount.accountID }, { $set: { 
            emailConfirmed: true 
        } })

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Email verified successfully."
        })

        response.json(responseData)

        response.once("finish", async () => {
            await axios.post(AppConfig.HOST + "/api/notifications/create-notification", {
                accountID: userAccount.accountID,
                content: `Your email address has been confirmed.`,
                image: userAccount.profileImage.url,
                clickable: false,
                redirect: ""
            }, { headers: { Authorization: `Bearer ${userAccount.access.token}` } })
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}

export default VerifyEmail;