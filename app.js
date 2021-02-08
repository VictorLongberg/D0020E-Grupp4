// code from https://socket.io/get-started/chat/
// code from https://socket.io/get-started/chat/

// Outside requirements
//var app = require('express')();
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


io.on('connection', (socket) => {
	memberCounter++;
	console.log('user connected, total users: ' +memberCounter);

	socket.on('disconnect', () => {
		console.log('user disconnected, total users: ' +memberCounter);
		memberCounter--;
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
});
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

http.listen(port, () => {
	console.log('Listening on 3000...');
});
