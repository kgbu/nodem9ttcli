var io = require('socket.io-client');

var socketURL = 'ws://free.mqtt.shiguredo.jp:8080/mqtt/';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

var client1 = io.connect(socketURL, options);

client1.on('connect', function(data) {
  console.log("connet");
  console.log("あなたの接続ID::" + client1.socket.transport.sessid);
  console.log("接続方式::" + client1.socket.transport.name);
});
