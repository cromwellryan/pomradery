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

io.sockets.on('connection', function (socket) {
	console.log('connected');

	var group = "pomradery"
		, endPomodoro = function() {
			io.sockets.in(group).emit("done"); 
	};

	socket.join(group);

	socket.on('start', function (data) {
		setTimeout( endPomodoro, 1 * 60 * 1000);	
		
		io.sockets.in(group).emit("started");
		
	});

});
