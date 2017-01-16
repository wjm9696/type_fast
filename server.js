var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//app.use(express.static(path.join(__dirname, 'client/build')))
var room = [];
var passages = [];
var currentPassageIndex = 0;
passages[0] = 'Jimmy is a handsome boy';
passages[1] = 'Jimmy is a computer scientist';
passages[2] = 'Jimmy is straight, absolutely';
passages[3] = 'Jimmy want to be rich';





app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('create_room',function(name){
		var potentialNum = Math.round(Math.random()*1000);
		while(room[potentialNum]!==undefined){
			potentialNum = Math.round(Math.random()*1000);
		}
		room[potentialNum] = [name];
		var info = new Object();
		info.roomNum = potentialNum;
		info.members = room[potentialNum];
		socket.join(potentialNum.toString());

		console.log(name + " create room " + potentialNum);
		socket.emit('creator_get_room_number', potentialNum);
		io.to(potentialNum.toString()).emit('success_room_info',JSON.stringify(info));

	});

	socket.on('join_room',function(info){
		info = JSON.parse(info);
		var name = info.name;
		var roomNum = info.roomNum;
		console.log("join_request_receive");
		if(room[roomNum]!==undefined){
			socket.join(roomNum.toString());
			room[roomNum].push(name);
			var info = new Object();
			info.roomNum = roomNum;
			info.members = room[roomNum];
			var update = new Object();
			update.name = name;
			update.pos = info.pos;
			update = JSON.stringify(update);

			//io.to(roomNum.toString()).emit('status_update',update);
			io.to(roomNum.toString()).emit('success_room_info',JSON.stringify(info));
			//socket.emit('success_room_info',JSON.stringify(info));
		}else{
			socket.emit('fail_room_number',"");
		}
	});

	socket.on('type_change',function(info){

		info = JSON.parse(info);
		var text = info.text;
		var roomNum = info.room;
		var name = info.name;

		info.pos = room[roomNum].indexOf(name);
		info = JSON.stringify(info);
		io.to(roomNum.toString()).emit('text_update',info);
	});

  socket.on('handle_passage_change',function(room){
    currentPassageIndex = currentPassageIndex+1;
    if(currentPassageIndex>=passages.length){
      currentPassageIndex = 0;
    }
    io.to(room.toString()).emit('passage_update',passages[currentPassageIndex]);

  });

  socket.on('getPassage',function(room){
    socket.emit('passage_update',passages[currentPassageIndex]);
  });

  socket.on('handleStartGame',function(room){
    io.to(room.toString()).emit('start_update','');
  });

  socket.on('handleGameWin',function(info){
    var room = info.roomNum;
    var winner = info.winner;
    io.to(room.toString()).emit('win_message', winner);
    io.to(room.toString()).emit('stopGame', winner+ " win!");

  });

  socket.on('handleGameStop',function(room){
    console.log(room);
    io.to(room.toString()).emit('stopGame', 'Game has been stopped');
  });

});


http.listen(3001, function(){
	console.log('listening on *:3001');
});
