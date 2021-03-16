const MongoClient = require('mongodb').MongoClient;
const url = 'Your URL here.';

async function findMessageById(id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("mydb");

        let collection = db.collection('Chat');

        let query = { id: id }

        let res = await collection.findOne(query);

        return res;

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

async function addMessage(roomId, id, name, date, msg, date){
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("mydb");

        let collection = db.collection('Chat');

        let object = {
            roomId:roomId, 
            id:id, 
            name:name, 
            date:date, 
            message:[{ message: msg, date: date }]
        };

        let res = await collection.insertOne(object);

        console.log(res);


    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

async function updateMessage(roomId, id, msg, date){
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("mydb");

        let collection = db.collection('Chat');

        let res = await collection.updateOne({id:id, roomId:roomId}, {$push: {message:[{ message: msg, date: date }]}});

        console.log(res);


    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

module.exports = {url};

addMessage(1,1,1,1,1,1);
updateMessage(1,1,"hej","datum");
updateMessage(1,1,"hej","datum");
updateMessage(1,1,"hej","datum");
