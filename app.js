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

	socket.on('chat message', (msg) => {
		console.log('m: ' + msg);
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});


http.listen(port, () => {
	console.log('Listening on 3000...');
});
