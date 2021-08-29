const { MongoClient } = require('mongodb');

const connectionUrl = 'mongodb://mxs:17017';

let db;

const getDatabaseInstance = async (name) => {
    if (db) {
        return db;
    }

    try {
        const client = await MongoClient.connect(connectionUrl);
        db = client.db(name);
    } catch (err) {
        throw err;
    } finally {
        return db;
    }
}

module.exports = getDatabaseInstance;