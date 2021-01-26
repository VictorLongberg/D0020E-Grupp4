// code from https://socket.io/get-started/chat/
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const port = 3000

var questionCounter = 0;

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', (socket) => {
	console.log('user connected')
	socket.on('disconnect', () => {
		console.log('user disconnected');
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
	
	socket.on('upvote', (questionID) => {
		console.log('question ' +questionID +'was upvoted');
		io.emit('upvote', questionID);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
