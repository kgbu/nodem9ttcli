var MQTT = require('simple-js-mqtt-client.js')
// Connect, publisha message and disconnect
MQTT.connect("free.mqtt.shiguredo.jp:8080", "hello-MQTT-2", function() {
MQTT.publish('kgbu@github/wstest', "here is my message");
MQTT.disconnect();
});
