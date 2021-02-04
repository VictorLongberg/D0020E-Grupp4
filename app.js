// code from https://socket.io/get-started/chat/
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
var session = require('express-session')

var sessionMiddleware = session({
  secret: '=very! ¤secret# "key/',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true , maxAge : 60000}
});

const port = 3000

/** Class representing a Lecture. */
class Lecture {
	constructor(){
		this.students = [];
	}

	get_student_by_id(id){
		for (var i = 0; i < this.students.length; i++){
			if (this.students[i].session_id == id){
				return this.students[i];
			}
		}
		return null;
	}

	student_exist(id){
		if (this.get_student_by_id(id) == null){
			return false;
		}
		return true;
	}

	add_student(id, name){
		var stud = this.get_student_by_id(id);
		if (stud == null){
			var stud = new Student(id, name);
			this.students.push(stud);
		} else {
			stud.set_name(name);
		}
	}

	get_student_name(id){
		var student = this.get_student_by_id(id);
		if (student == null){
			return "Unknown";
		}
		return student.get_name();
	}
}

/** Class representing a Student. */
class Student {
	/**
	 * @param  {string} id id - Session-ID
	 * @param  {string} name name - Name of student
	 */
	constructor(id, name) {
		this.session_id = id;
		this.name = name;
		this.timeJoined = this.timeJoined;
		//this.timeLeft = timeLeft;
		this.msg = [];
	}

	get_name() {
		return this.name;
	}

	set_name(name) {
		this.name = name;
	}
}


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


const lecture_1 = new Lecture();


//Sessions (experess-session)
app.use(sessionMiddleware);

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
	console.log(req.session.id);
	console.log(lecture_1.get_student_name(req.session.id));
});

io.on('connection', (socket) => {

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('chat message', (isAnonymous, msg) => {
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		io.emit('chat message', name, msg);
	});

	socket.on('question', (isAnonymous, msg) => {
		if (isAnonymous){
			name = "Anonymous";
		} else {
			name = lecture_1.get_student_name(socket.request.session.id);
		}
		io.emit('question', name, msg);
	});

	socket.on('name', (name) => {
		lecture_1.add_student(socket.request.session.id, name);
		console.log(lecture_1.students);

	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
