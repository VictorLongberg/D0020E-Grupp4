// code from https://socket.io/get-started/chat/
// code from https://socket.io/get-started/chat/

//var app = require('express')();
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const port = 3000

var questionCounter = 0;
var memberCounter = 0;


app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	memberCounter++;
	console.log('user connected, total users: ' +memberCounter);

	socket.on('disconnect', () => {
		console.log('user disconnected, total users: ' +memberCounter);
		memberCounter--;
	});

	socket.on('chat message', (sender, msg) => {
		console.log(sender + ": " + msg);
		io.emit('chat message', sender, msg);
	});

	socket.on('question', (sender, msg, questionID) => {
		console.log(sender + ": <question> " + msg);
		io.emit('question', sender, msg, questionCounter);
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
