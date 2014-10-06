var WebSocket = require('ws');
var ws = new WebSocket('ws://free.mqtt.shiguredo.jp:8080/mqtt',{protocol: 'mqtt, mqttv3.1'});
ws.supports.binary = true;
ws.on('open', function() {
    var array = new Float32Array(5);
    for (var i = 0; i < array.length; ++i) array[i] = i / 2;
    ws.send(array, {binary: true, mask: true});
});
