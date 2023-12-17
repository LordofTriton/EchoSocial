import { getDB } from "../../../util/db/mongodb";
import axios from "axios";

async function Find(collection, filters, page, pageSize) {
    const skip = (pagination.page - 1) * pagination.pageSize;
    const result = await db.collection(collection).find(filters).skip(skip).limit(pageSize).toArray();
    if (!result) return { count: 0, data: [] };

    const count = await db.collection(collection).countDocuments(filters);
    return { count, data: applications };
};

async function InsertOne(collection, data) {
    const result = await db.collection(collection).insertOne(data).toArray();
    if (!result) throw new Error("An error occurred.")

    const count = await db.collection(collection).countDocuments(filters);
    return { count, data: applications };
};

var InsertOne = (db_connect, item, storeName) => (
    new Promise((resolve, reject) => {
        db_connect.collection(storeName).insertOne(item, function (err, res) {
            var somethingWentWrong = (res == null);
            (somethingWentWrong) ? reject('Something messed up :)') : resolve(res);
        })
    })
);

var UpdateYggdrasil = (db_connect, label, records) => (
    new Promise((resolve, reject) => {
        db_connect.collection("Yggdrasil").updateOne({label: label}, {$set: {records: records}}, function (err, res) {
            var somethingWentWrong = (res == null);
            (somethingWentWrong) ? reject('Something messed up :)') : resolve(res);
        })
    })
);

const DBClient = {
    StoreCompiler, 
    ResearchCompiler, 
    GetStore, 
    InsertOne, 
    UpdateYggdrasil
};

export default DBClient;