var io = require('socket.io')
	, express = require('express')
	, fs = require('fs');

var port = process.env.PORT || 9191;
var app = express.createServer();

outfile = function(path, contenttype, res) {
	console.log('outing: ' + path);

	fs.readFile(path, function (err, data) {
		if( err ) throw err;
		else {
			res.contentType(contenttype);
			res.end( data );
		}

	});
};


app.get('/', function(req,res) {
	outfile('index.htm', 'text/html', res);
});

app.get('/:type/:script', function(req,res) {
	var extensions = { scripts: '.js',
		styles: '.css' };

	var contenttypes = { scripts: 'text/javascript',
		styles: 'text/stylesheet' };

	var type = req.params.type;
	var scriptname = req.params.script; 
	var extension = extensions[type];
	var contenttype = contenttypes[type];

	var path = type + "/" + scriptname + extension;

	outfile(path, contenttype, res);
});

app.listen(port);
var sio = io.listen(app);

var pomodoro = function() {
	var started = false
		,	done = null,

	endPomodoro = function() {
		done();
		started = false;
	},

	start = function(duration, ondone, onstarted) {
		if(started) return;
		done = ondone;
		started = true;

		setTimeout( endPomodoro, duration * 60 * 1000);	

		onstarted();
	}	

	return { start: start };

}
	
var currentpom = new pomodoro();

sio.sockets.on('connection', function (socket) {
	var pomodoroduration = 25
		, group = "pomradery";

	socket.join(group);

	var expired = function() {
		sio.sockets.in(group).emit("done"); 
	};

	socket.on('start', function (data) {
		currentpom.start(pomodoroduration, expired, function() { 
			sio.sockets.in(group).emit("started", { duration: pomodoroduration });
		});
	});


	socket.emit('remaining', { duration: pomodoroduration });

});
