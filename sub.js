var mqtt = require('mqtt');
var fs = require('fs');
var process = require('process');

var cfg = JSON.parse(fs.readFileSync(process.env.HOME+'/.mqttcli.cfg', 'utf8'));

var host = cfg.host || 'localhost';
var port = cfg.port || 1883;

var client = mqtt.createClient(cfg.port, cfg.host, { username: cfg.username, password : cfg.password });

var topic= cfg.username+'/#';

client.subscribe(topic);

console.log('topic:message');

client.on('message', function(topic,message) {
  console.log(topic+':'+message);
});

