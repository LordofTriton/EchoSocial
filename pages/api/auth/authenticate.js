import DateGenerator from "../../../services/generators/DateGenerator";
import ResponseClient from "../../../services/validation/ResponseClient";
import { getDB } from "../../../util/db/mongodb";

export const authenticate = (handler) => async (req, res) => {
    const { db } = await getDB();

    try {
        const accessToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
        if (!accessToken) throw new Error("Unauthorised. Are you signed in?");

        const userAccount = await db.collection("accounts").findOne({ "access.token": accessToken })
        if (!userAccount) throw new Error("Unauthorised. Are you logged in?")
        if (DateGenerator.hoursBetween(Date.now(), userAccount.lastLogin) > 24) throw new Error("Your login expired. Please re-login.")

        return handler(req, res);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        res.json(responseData)
    }
};