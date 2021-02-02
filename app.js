// code from https://socket.io/get-started/chat/
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
var session = require('express-session')

const port = 3000

/** Class representing a Lecture. */
class Lecture {
	constructor(){
		this.students = [];
	}

	add_student(id, name){
		var stud = new Student(id, name);
		this.students.push(stud);
	}

	get_student_name(id){
		for (var i = 0; i < this.students.length; i++){
			if (this.students[i].session_id == id){
				return this.students[i].name;
			}
		}
		return "Unknown";
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
		this.timeLeft = timeLeft;
		this.msg = [];
	}

	getName() {
		return this.name;
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
app.use(session({
  secret: '=very! ¤secret# "key/',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true , maxAge : 60000}
}))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
	console.log(req.session.id);
	lecture_1.add_student(req.session.id, "test");
	console.log(lecture_1.get_student_name(req.session.id));
});

io.on('connection', (socket) => {
	console.log('user connected')
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('chat message', (msg) => {
		//Lägga till det som skickas till message listan i Student.
		console.log('m: ' + msg);
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
