var ops = {username: 'USERNAME',
      password: 'PASSWD'};
var mows   = require('mows')
  , client = mows.createClient(80,'ws://localhost:80/mqtt',ops);

client.subscribe ('topicbase/#');
client.publish('topicbase/mowstest', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(topic, message);

  client.end();
});
