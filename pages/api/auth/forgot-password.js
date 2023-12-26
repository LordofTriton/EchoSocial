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
    if (!data.email || data.email.length < 2 || !data.email.includes("@")) throw new Error("Invalid email.")
}

async function ForgotPassword (request, response, authToken) {
    const { db } = await getDB();
    const params = {
        email: request.body.email
    }

    try {
        ValidateResetPassword(params);
        const resetToken = IDGenerator.GenerateAccessToken()

        const userAccount = await db.collection("accounts").findOne({ email: params.email })
        if (!userAccount) throw new Error("No user with this email exists.")

        await SendEmail(params.email, "Forgot Password", "forgot-password", {
            firstName: userAccount.firstName,
            resetPasswordUrl: `${AppConfig.HOST}/reset-password?token=${resetToken}`
        })

        await db.collection("accounts").updateOne({ email: params.email }, { $set: { 
            resetToken 
        } })

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Password reset email sent successfully."
        })

        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}

export default ForgotPassword;