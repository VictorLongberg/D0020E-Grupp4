// code from https://socket.io/get-started/chat/
// code from https://socket.io/get-started/chat/

// Outside requirements
//var app = require('express')();
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var session = require('express-session');

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
lecture_1.add_queue('test');

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

		appendLog(logInfo);
	});

	socket.on('name', (name) => {
		console.log("add user", typeof socket);
		lecture_1.add_student(socket.request.session.id, name, socket);
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

		appendLog(logInfo);
		questionCounter++;
	});

	socket.on('upvote', (questionID, memberNum) => {
		console.log('question ' +questionID +' was upvoted');
		io.emit('upvote', questionID, memberCounter);
	});

	socket.on('join_queue', (q_name) => {
		var q = lecture_1.get_queue(q_name);
		if (q != null){
			q.add_student(socket.request.session.id);
		}
		console.log(q);
	});

	socket.on('get_first_queue', (q_name) => {
		var q = lecture_1.get_queue(q_name);
		var stud = lecture_1.get_student_by_id(q.get_first());
		console.log(stud);
		if (stud != null){
			stud.socket.emit('picked_out');
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
