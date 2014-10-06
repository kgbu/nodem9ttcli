var serverio = require('socket.io').listen(8001);

serverio.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

var clientio = require('socket.io-client');
var socket = clientio.connect('ws://free.mqtt.shiguredo.jp:8080/mqtt/');
  socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});
