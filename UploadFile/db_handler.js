const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient('mongodb://127.0.0.1:27017/');

module.exports = {
    connect_db: async function (req, res) {
    try {
        // Подключаемся к серверу

        await mongoClient.connect();
        
        const db = mongoClient.db("FILES");
        const collection = db.collection("files");
        return collection;
    }catch(err) {

        console.log("Возникла ошибка");
        
        console.log(err);
    }
}   
}  