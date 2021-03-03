// code from https://socket.io/get-started/chat/ now edited beyond rekognition

// Outside requirements
//var app = require('express')();
const express		= require('express');
const app 			= express();
var http 			= require('http').createServer(app);
var io 				= require('socket.io')(http);
var session   		= require('express-session');
var bodyParser 		= require("body-parser");
var cookieParser 	= require('cookie-parser');

//Login&Register stuff. 
app.use(bodyParser.json()); // for parsing application/json	
app.use(express.json());
app.use(cookieParser()); 


//db
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://Elie:Elie123@cluster0.fhfjx.mongodb.net/mydb?retryWrites=true&w=majority"; //https://cloud.mongodb.com/v2/6020afbf25845140b0c65d17#metrics/replicaSet/6020b097ea48a608bd83ea68/explorer/mydb/Chat/find
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const { Mongoose } = require('mongoose');
var ObjectID = require('mongodb').ObjectID;

// Own requirements
var student = require('./student.js');
var lecture = require('./lecture.js');
var queue = require('./queue.js');
var ticket = require('./ticket.js');

//Session.
var sessionMiddleware = session({
  secret: '=very! ¤secret# "key/',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true , maxAge : 60000}
});

//Sessions (experess-session)
app.use(sessionMiddleware);

//Express. 
app.use(express.static('public'));
1
const port = 3000;

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

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

//GlobalVariables
var questionCounter = 0;
var memberCounter = 0;
var confuseCounter = 0;

//Mappings
app.get("/register", function (req, res) {
	res.sendFile(__dirname + "/public/register.html");
});

  app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
});

app.get('/student', (req, res) => {
	res.sendFile(__dirname + '/public/indexStudent.html');
	console.log(req.session.id);
	console.log(lecture_1.get_student_name(req.session.id));
});


//Login.
app.post("/login", async function (req, res) {
	login(req, res);
});

//Registering.
app.post("/register", async function (req, res) {
	register(req, res);
});

app.get('/teacher', (req, res) => {
	//amisafe(req);
	//var authenticated = amisafe(req);
	amisafe(req).then(authenticated => {
		if (authenticated) {
			console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
			console.log(authenticated);
			console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
			res.sendFile(__dirname + '/public/indexTeacher.html');
		} if (!authenticated) {
			console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
			console.log(authenticated);
			console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
			res.redirect("/register");
		}
	});
})

//funktion for authentication. 
function amisafe(req, res) {
	const kakan = get_cookies(req)["tss"];

	client.connect;
	//const client = MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
	//var dbo = client.db("mydb");
	console.log("{_id: kakan}");
	console.log({ _id: kakan });

	var o_id = new ObjectID(kakan);
	console.log("o_id");
	console.log(o_id);
	client.db("mydb").collection("login").findOne({ "_id": o_id }).then(function (checkLogin) {
		if (checkLogin != null) {
			res.sendFile(__dirname + '/public/indexTeacher.html');
		} else {
			res.redirect("/register");
		}
		// })
		// .catch(() => {
		// 	console.log("err");
	}).finally(() => {
		client.close();
	});
};


//Functions for logging and register.

var get_cookies = function (request) {
	var cookies = {};
	request.headers && request.headers.cookie.split(';').forEach(function (cookie) {
		var parts = cookie.match(/(.*?)=(.*)$/);
		cookies[parts[1].trim()] = (parts[2] || '').trim();
	});
	return cookies;
}

function login(req, res) {
	client.connect(async err => {
		const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
		var dbo = client.db("mydb");
		dbo.collection("login").findOne({ email: req.body.email, password: req.body.password }).then(checkLogin => {
			try {
				if (checkLogin != null) {	
					res.header("Set-Cookie", "tss=" + checkLogin._id);
					res.redirect("/teacher");
				} else { res.status(400).send({ message: 'This is an error!' }); }
			} catch (error) {
				console.log(err);
			} finally {
				client.close();
			}
		});
	});
}

function register(req, res) {
	var checkNull = null;
	client.connect(async err => {
		const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
		var dbo = client.db("mydb");
		checkNull = await dbo.collection("login").findOne({ email: req.body.email });
		try {
			if (checkNull == null) {
				const insertdata = await dbo.collection("login").insertOne({ email: req.body.email, password: req.body.password });
				console.log("banan" + insertdata);
				res.redirect("/login");
			} else { res.status(400).send({ message: 'This is an error!' }); }
		} catch (error) {
			console.log(err);
		} finally {
			client.close();
		}
	});
}

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

		let res = findMessageById("Inget", socket.request.session.id);
		res.then(function(result) {
			//console.log(result)
			if(result==null){//New User
				addMessage(roomId="Inget",id=socket.request.session.id, name=name,date=date,msg=msg,date=date);
			}else{//Old User
				updateMessage(roomId="Inget",socket.request.session.id,msg=msg,date=date);
			}
		 })
        appendLog(logInfo);
    });

	socket.on('name', (name) => {
		lecture_1.add_student(socket.request.session.id, name, socket);
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
		
		addQuestion(roomId="Inget",id=questionCounter,name=name,question=msg,date=date, upvote=0);
		appendLog(logInfo);
		questionCounter++;
	});

	socket.on('upvote', (questionID, memberNum) => {
		console.log('question ' +questionID +' was upvoted');
		io.emit('upvote', questionID, memberCounter);

		upvoteQuestion(roomId="Inget",questionID);
	});

	socket.on('join_queue', (q_name, message) => {
		var q = lecture_1.get_queue(q_name);
		//console.log("parameters:", q_name, message);
		if (q != null){
			var stud = lecture_1.get_student_by_id(socket.request.session.id)
			var n_ticket = new ticket.Ticket(0, stud, message);
			q.add_ticket(n_ticket);
			console.log("added ticket:\n", n_ticket);
			console.log("json queue:\n", q.to_json());
		}
	});

	socket.on('get_first_queue', (q_name) => {
		var q = lecture_1.get_queue(q_name);
		if (q != null) {
			var tick = q.get_first();
			if (tick != null) {
				//console.log("message: ", tick.message);
				let sl = tick.get_socketlist();
				sl.forEach((st) => {
					st.emit('picked_out');
					st.emit('update_queue_place', 'none');
				});
			}
		}
	});
	
	socket.on('reactConfused', () => {
		var date = new Date();
		confuseCounter++;
		io.emit('updateConfused', confuseCounter);
		var id = socket.id;
		//Måste få tag på roomID!

		let res = findConfusedById("Inget", socket.request.session.id);
		res.then(function(result) {
			//console.log(result)
			if(result==null){//New User getting confused
				addConfused(roomId="Inget", socket.request.session.id, date=date);
			}else{//Old User getting confused
				updateConfused(roomId="Inget", socket.request.session.id, date=date);
			}
		 })
		
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
const { response } = require('express');
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




//db stuff
async function findMessageById(roomId, id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("mydb");

        let collection = db.collection('Chat');

        let query = {roomId:roomId, id: id }

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

        console.log("Succesfully added message to new User");


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
		
		let messageObj = {message: msg, date: date};
        let res = await collection.updateOne({id:id, roomId:roomId}, {$push: {message:messageObj}});

        console.log("Succesfully added message to user");

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}



async function addQuestion(roomId, id, name, question, date, upvote){
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("mydb");

        let collection = db.collection('Question');

		let object = {
            roomId:roomId, 
            id:id, 
            name:name,
            question:question, 
            date:date, 
            upvote:upvote
        };

		let res = await collection.insertOne(object);

		console.log("Inserted question succesfully");

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

//BUG IN QUESTION WHERE THE FIRST QUESTION CANT GET ANY UPVOTES!!!!!
async function upvoteQuestion(roomId, id){
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("mydb");

        let collection = db.collection('Question');

		let res = await collection.updateOne({id:id},{$inc:{upvote:10}});

		console.log("Succesfully incremented upvote in database");

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

async function addConfused(roomId, id, date){
    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("mydb");

        let collection = db.collection('Confused');

		let object = {
            roomId:roomId, 
            id:id,
            confusion:[{confused:1, date,date}]
        };

		let res = await collection.insertOne(object);

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

async function findConfusedById(roomId, id) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("mydb");

        let collection = db.collection('Confused');

        let query = { roomId:roomId, id: id }

        let res = await collection.findOne(query);

        return res;

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
    }
}

async function updateConfused(roomId, id, date) {

    const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("mydb");

        let collection = db.collection('Confused');
		
		let confusedObj = {confused:1, date,date};
        
		let res = await collection.updateOne({roomId:roomId, id:id},{$push: {confusion:confusedObj}});

        return res;

    } catch (err) {

        console.log(err);

    } finally {

        client.close();
    }
}