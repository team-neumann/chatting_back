var express = require('express');
var app = express();
var cryp = require("crypto")
// var expressWs = require('express-ws')(app);
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const cors = require('cors');
var uuidv4 = require('uuid').v4;

let rooms = {};
let chatLogs = {};

app.use(cors());

app.get('/room', function (req, res, next) {
	const room = {
		name: req.query.name,
		id: cryp.createHash("sha256")
				.update(req.query.name)
				.digest("hex")
	};
	rooms[room.id] = room;
	chatLogs[room.id] = [];
	console.log("room");
	console.log(room);
	res.json(room);
});

app.get('/room/:roomId', function (req, res, next) {
	const roomId = cryp.createHash("sha256")
					   .update(req.params.roomId)
					   .digest("hex");
	const response = {
		...rooms[roomId],
		chats: chatLogs[roomId]
	};
	console.log("roomId");
	console.log(response);
	res.json(response);
});

// app.ws('/', function (ws, req) {
// 	console.log("socket")
// 	ws.on('connection', function(socket){
// 		console.log("conect")
// 	})
// 	ws.on('essage', function (msg) {
// 		console.log(msg);
// 	});
// });

// app.listen(5000);

io.on('connection', function(socket) {
	socket.on('event://send-message', function(msg) {
		console.log("got", msg);
		
		const payload = JSON.parse(msg);
		if(chatLogs[payload.roomID]){
			chatLogs[msg.roomID].push(payload.data);
		}
		
		socket.broadcast.emit('event://get-message', msg);
	});
	socket.on('event://login', function(msg) {
		const payload = JSON.parse(msg);
		socket.broadcast.emit('event://login');
	});
});
  
http.listen(5000, function(){
	console.log('listening on *:5000');
});