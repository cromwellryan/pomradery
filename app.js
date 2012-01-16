var io = require('socket.io')
	, express = require('express')
	, fs = require('fs');

var app = express.createServer()
	, io = io.listen(app),

outfile = function(path, contenttype, res) {
	console.log('outing: ' + path);

	fs.readFile(path, function (err, data) {
		if( err ) throw err;
		else {
			res.contentType(contenttype);
			res.send( data );
		}

		res.end();
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

var port = process.env.PORT || 8080;
app.listen(port);

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

io.sockets.on('connection', function (socket) {
	var pomodoroduration = 25
		, group = "pomradery";

	socket.join(group);

	var expired = function() {
		io.sockets.in(group).emit("done"); 
	};

	socket.on('start', function (data) {
		currentpom.start(pomodoroduration, expired, function() { 
			io.sockets.in(group).emit("started", { duration: pomodoroduration });
		});
	});


	socket.emit('remaining', { duration: pomodoroduration });

});
