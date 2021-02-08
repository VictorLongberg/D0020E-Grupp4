const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Elie:Elie123@cluster0.fhfjx.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    var query = { cuisine:"American" };
    //const collection = client.db("sample_restaurants").collection("restaurants").findOne({}, function(err, result){
    var dbo = client.db("mydb");
    dbo.createCollection("Chat", function(err, res) {
    //console.log(result);
    client.close();
});






// perform actions on the collection object
client.close();
});
