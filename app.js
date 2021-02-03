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

class lecture {
	constructor(){
		this.students = [];
	}

	add_student(id, name){
		var stud = new student(id, name);
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

class student {
	constructor(id, name) {
		this.session_id = id;
		this.name = name;
	}

	getName() {
		return this.name;
	}
}

const lecture_1 = new lecture();


//Sessions (experess-session)
app.use(sessionMiddleware);

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
	console.log(req.session.id);
	lecture_1.add_student(req.session.id, "test");
	console.log(lecture_1.get_student_name(req.session.id));
});

io.on('connection', (socket) => {

	console.log('user connected');
	console.log('sesssionID', socket.request.session.id);

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('chat message', (sender, msg) => {
		console.log(sender + ": " + msg);
		io.emit('chat message', sender, msg);
	});

	socket.on('question', (sender, msg) => {
		console.log(sender + ": <question> " + msg);
		io.emit('question', sender, msg);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
