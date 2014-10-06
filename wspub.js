
var io = require('socket.io-client')('ws://free.mqtt.shiguredo.jp:8080/mqtt/');


io.transports = ['xhr-polling'];

var fs = require('fs');
var process = require('process');

var cfg = JSON.parse(fs.readFileSync(process.env.HOME+'/.mqttcli.cfg', 'utf8'));

var host = cfg.wshost || 'localhost';
var port = cfg.wsport || '8080';
var path= cfg.wspath || '/mqtt';

var url = "ws://"+host+":"+port+path;
url = 'ws://free.mqtt.shiguredo.jp:8080/mqtt/';
console.log(url);
var opt = {
	'force new connection':true
};
var socket = io.connect(url);

socket.on('connection', function(msg) {
  console.log("connet");
  console.log("あなたの接続ID::" + socket.socket.transport.sessid);
  console.log("接続方式::" + socket.socket.transport.name);
});

var msg='hohoho';
socket.emit('message', msg);

console.log(msg);

socket.disconnect();
