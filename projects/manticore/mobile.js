var WebSocket = require("ws");
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var osc = require('osc');
var dgram = require('dgram');
var client = dgram.createSocket('udp4');
var app = express();
app.use("/", express.static(__dirname + "/web"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
var options = process.argv;
var port = options[3] ? options[3] : 8081;

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
  name: 'logging',
  streams: [
  {
    level: 'trace',
    path: './log_requests.log'
  }]
});

var server = http.createServer(app).listen(port, function() {
    console.log((new Date()) + ' Server is listening on port ' + port);
});
// Listen for Web Socket requests.
var wss = new WebSocket.Server({
    server: server
});

var dataQueue = {};
var requesters = {};
var table = {};

// Listen for Web Socket connections.
wss.on("connection", function (socket) {
  var socketPort = new osc.WebSocketPort({
      socket: socket
  });
  var id;
  socketPort.on("bundle", function (oscMsg) {
    logger.info('Received OSC Bundle in mobile.js');
    id = oscMsg.packets[0].args[0];
    if (!table[id]) {
	  	table[id] = 1;
	  	request.post('http://127.0.0.1:3000/mobile', {form: {status: 1, id: id}}, function(error) {});
    }
    if (requesters[id] != undefined) {
    	for (var rid in requesters[id]) {
    		requesters[id][rid].data.push(oscMsg);
    	}
    }
  });
  socketPort.on("close", function() {
  	console.log((new Date()) + ' Peer ' + id + ' disconnected.');
  	request.post('http://127.0.0.1:3000/mobile', {form: {status: 0, id: id}}, function(error) {});
  	delete table[id];
  });
});

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 57121
});

// Open the socket.
udpPort.open();

app.post('/addRequester', function(req, res) {
	var id = req.body.id;
	var addr = req.body.address;
	var port = req.body.port;
	var rid = addr + ':' + port;
	req.body.data = [];
	req.body.tid = setInterval(function() {
		if (requesters[id][rid].data.length > 0) {
			// var data = requesters[id][rid].data.shift();
			var data = osc.writeBundle(requesters[id][rid].data.shift());
			// request.post('http://' + addr + ':' + port, {form: data}, function(error) {});
//			console.log(addr);
//			console.log(port);
			// udpPort.send(data, addr, port);
			client.send(data, 0, data.length, port, addr, function(err, bytes){
				if (err) {
        				throw err;
				}
			});
		}
	}, 2);
	if (!requesters[req.body.id]) {
		requesters[req.body.id] = {};
	}
	requesters[req.body.id][rid] = req.body;
	res.end('ok');
});

app.post('/removeRequester', function(req, res) {
	var id = req.body.id;
	var addr = req.body.address;
	for (var i in requesters[req.body.id]) {
		if (i.indexOf(addr) != -1) {
//			console.log(requesters[req.body.id][i]);
			clearInterval(requesters[req.body.id][i].tid);
			delete requesters[req.body.id][i];
		}
	}
	res.end('ok');
});
