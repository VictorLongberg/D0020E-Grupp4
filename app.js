// code from https://socket.io/get-started/chat/
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const port = 3000


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

	socket.on('question', (sender, msg) => {
		console.log(sender + ": <question> " + msg);
		io.emit('question', sender, msg);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
