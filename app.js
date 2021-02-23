// code from https://socket.io/get-started/chat/
// code from https://socket.io/get-started/chat/

// Outside requirements
//var app = require('express')();
var mongoose = require("mongoose");
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var session = require('express-session');

//db
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Elie:Elie123@cluster0.fhfjx.mongodb.net/mydb?retryWrites=true&w=majority"; //https://cloud.mongodb.com/v2/6020afbf25845140b0c65d17#metrics/replicaSet/6020b097ea48a608bd83ea68/explorer/mydb/Chat/find
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// Own requirements
var student = require('./student.js');
var lecture = require('./lecture.js');
var queue = require('./queue.js');

var sessionMiddleware = session({
  secret: '=very! ¤secret# "key/',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true , maxAge : 60000}
});

const port = 3000
var url = 'mongodb://localhost:27017/mydb';


/** Class representing a Message. */
class Message{
	constructor(name, content, time, type){
		this.name = name;
		this.content = content;
		this.time = time;
		this.type = type; //Question, regular etc...
		this.upvote = this.upvote;
	}
}


const lecture_1 = new lecture.Lecture();

//Sessions (experess-session)
app.use(sessionMiddleware);

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
	console.log(req.session.id);
	console.log(lecture_1.get_student_name(req.session.id));
});

var questionCounter = 0;
var memberCounter = 0;
var confuseCounter = 0;

io.on('connection', (socket) => {
	memberCounter++;
	console.log('user connected, total users: ' +memberCounter);

	socket.on('disconnect', () => {
		memberCounter--;
		console.log('user disconnected, total users: ' +memberCounter);
	});

	socket.on('chat message', (isAnonymous, msg, date) => {
		var date = new Date();
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		io.emit('chat message', name, msg, date.valueOf());
		
		var logInfo = "Chat by: " +name +":" +msg;
		
		if (date.getHours() < 10) {
			logInfo += " - 0" +date.getHours();
		} else {
			logInfo += " - " +date.getHours();
		}

		if (date.getMinutes() < 10) {
			logInfo += ":0" +date.getMinutes();
		} else {
			logInfo += ":" +date.getMinutes();
		}


		client.connect(err => {
			var dbo = client.db("mydb");

			//Check if user already has commented
			dbo.collection("Chat").findOne({ id: socket.request.session.id }, { projection: { _id: 0, id: 1, name:1 } }, function (err, result) {
				if(result==null){//New user
					var object = {
						roomId:"Inget", 
						id:socket.request.session.id, 
						name:name, 
						date:date, 
						message:[{ message: msg, date: date }]
					};
					
					dbo.collection("Chat").insertOne(object, function(err, res) {
					console.log("Inserted message to Database.");
					});

				}else{//Old user
					dbo.collection("Chat").update(
						{ id:socket.request.session.id },
						{ $push: {message:[{ message: msg, date: date }]}},
					);
				}
			});
			client.close();
		});

		appendLog(logInfo);
	});

	socket.on('name', (name) => {
		lecture_1.add_student(socket.request.session.id, name);
		console.log(lecture_1.students);
	});

	socket.on('question', (isAnonymous, msg) => {
		var date = new Date();
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		io.emit('question', name, msg, questionCounter, date.valueOf());
		
		var logInfo = "Question #" +questionCounter +" by: " +name +":" +msg;

		if (date.getHours() < 10) {
			logInfo += " - 0" +date.getHours();
		} else {
			logInfo += " - " +date.getHours();
		}

		if (date.getMinutes() < 10) {
			logInfo += ":0" +date.getMinutes();
		} else {
			logInfo += ":" +date.getMinutes();
		}
		
		var object = {
			roomId:"Inget", 
			id:questionCounter, 
			name:name,
			question:msg, 
			date:date, 
			upvote:0
		};
		client.connect(err => {
			var dbo = client.db("mydb");
			dbo.collection("Question").insertOne(object, function(err, res) {
			console.log("Inserted question to Database.");
			});
		client.close();
		});
		appendLog(logInfo);
		questionCounter++;
	});

	socket.on('upvote', (questionID, memberNum) => {
		console.log('question ' +questionID +' was upvoted');
		io.emit('upvote', questionID, memberCounter);

		var upvote = 0;
		client.connect(err => {
			var dbo = client.db("mydb");
			dbo.collection("Question").updateOne({id:questionID},{$inc:{upvote:1}},function(err,res) {
				console.log("Updated upvotes in Database");
			});
		client.close();
		});
	});
	
	socket.on('reactConfused', () => {
		confuseCounter++;
		io.emit('updateConfused', confuseCounter);
		var id = socket.id;
		setTimeout(confusedStop, 3000, id);
	});
	
	socket.on('removeConfused', () => {
		confuseCounter--;
		io.emit('updateConfused', confuseCounter);
	});
	
});

function confusedStop(id) {
	io.to(id).emit("toggleConfuse");
}


// Logging (WILL PROBABLY BE HANDLED VIA DATABASE INSTEAD)
		

// Logging
const dir = "./logs/sessionID";
var fs = require("fs");
var directoryFound = false;

function appendLog(logInfo) {
	if (!directoryFound) {
		try {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
				console.log("Log directory is created.");
			} else {
				console.log("Log directory already exists.");
			}
			directoryFound = true;
		} catch (err) {
			console.log(err);
		}
	}

	fs.appendFile('logs/sessionID/log.txt', logInfo +"\n", function(err) {
		if (err) {
			directoryFound = false;
			return console.error(err);
		}
	});
}

//Login And Register Testing.

var MongoClient = require('mongodb').MongoClient;
const { Mongoose } = require('mongoose');
//standart local mongodb url. Can be changed for relative url. 
var url = "mongodb://localhost:27017/";

//Skapar connection till databas mellan nodejs och innehåller ett värde i sig för att inte skapa ngt tomt blabla.
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  var myobj = { Email: "Admin", Password: "Admin123" };
 //await Email.createIndex({ login_email: 1 }, { unique: true }); Ska skapa en index för uniqa emails (fungear inte atm)
  dbo.collection("login").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
}); 

//Register forum för post från register.
app.post("/public/register.html", function (req, res) { 
		var ReginObj = {Email: req.body.email, Password: req.body.password};
		dbo.collection("login").insertOne(ReginObj, function(err, res) {
			if (err) res.send("A account with that email already exists");
			else res.send("Succesfully inserted");
			db.close();
	}); 
});


//Login forum för post från register.
app.post("/public/login.html", function (req, res) { 
	dbo.collection("login").findOne({Email: req.body.email, Password: req.body.password}, function(err, res) {
		if (err) res.send("A account with that email already exists");
		elseres.redirect('public/index.html');
		db.close();
	}); 
});

http.listen(port, () => {
	console.log('Listening on 3000...');
});