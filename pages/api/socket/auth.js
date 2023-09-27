import { getDB } from "../../../util/db/mongodb";

export default async function SocketAuth(data) {
    const { db } = await getDB();
    if (!data.accessToken) return false;

    const userAccount = await db.collection("accounts").findOne({ "access.token": data.accessToken })
    if (userAccount) {
        db.collection("accounts").updateOne({ "access.token": data.accessToken }, { $set: {
            lastActive: Date.now()
        } })
        return true;
    }
    else return false;
}