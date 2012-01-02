var io = require('socket.io')
	, express = require('express')
	, fs = require('fs');
		


var app = express.createServer()
	, io = io.listen(app);


app.get('/', function(req,res) {
	fs.readFile('index.htm', function (err, data) {
		if( err ) throw err;
		else {
			res.contentType('text/html');
			res.send( data );
		}
			res.end();
	});
});

app.get('/scripts/:script', function(req,res) {
	fs.readFile(req.params.script + '.js', function (err, data) {
		if( err ) throw err;
		else {
			res.contentType('text/html');
			res.send( data );
		}
			res.end();
	});
});


app.listen(8080);

var pomodoro = function() {
	var started = false
		,	done = null,

	endPomodoro = function() {
		done();
		started = false;
	},

	start = function(duration, ondone) {
		if(started) return;
		done = ondone;
		started = true;

		setTimeout( endPomodoro, duration * 60 * 1000);	
	}	

	return { start: start };

}
	
var currentpom = new pomodoro();

io.sockets.on('connection', function (socket) {
	var pomodoroduration = 1
		, started = false
		, group = "pomradery";

	socket.join(group);

	var expired = function() {
		io.sockets.in(group).emit("done"); 
	};

	socket.on('start', function (data) {
		currentpom.start(pomodoroduration, expired);
		io.sockets.in(group).emit("started", { duration: pomodoroduration });
	});

});
