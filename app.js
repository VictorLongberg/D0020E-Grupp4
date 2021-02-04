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

	socket.on('chat message', (isAnonymous, msg) => {
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		io.emit('chat message', name, msg);
	});

	socket.on('name', (name) => {
		lecture_1.add_student(socket.request.session.id, name);
		console.log(lecture_1.students);
	});

	socket.on('question', (isAnonymous, msg, questionID) => {
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		console.log(name + ": <question> " + msg);
		io.emit('question', name, msg, questionCounter);
		questionCounter++;
	});

	socket.on('upvote', (questionID, memberNum) => {
		console.log('question ' +questionID +' was upvoted');
		io.emit('upvote', questionID, memberCounter);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
