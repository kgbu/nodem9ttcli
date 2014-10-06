Node.js で MQTT をコマンドラインで試してみるログ（続けたい...）

時雨堂さんがMQTTブローカーサービスhttp://sango.shiguredo.jp をリリースして以来、ちょっと元気がでたので、素振りと称してやっつけてますw

motivated by：http://null.ly/post/56517703680/apache-apollo-node-js-mqtt

とりあえずの置き場：github: https://github.com/kgbu/nodem9ttcli

## History
1. Draft : 2014/9/18
1. initial post on Qiita : 2014/9/21

## 準備

### case Mac:

Mac OSX (10.9)の環境で、まずはnode.jsをインストール。これはhttp://nodejs.org/ でINSTALLボタンをクリックするだけ。
その後、MQTTと必要になるパッケージをnpmでインストール。

+ node : v0.10.32
+ npm : 1.4.28

```{sh}
$ npm install mqtt fs process
```

+ mqtt : 0.3.12
+ fs(filesystem) : 1.0.1
+ process : 0.8.0

### case CentOS (64bit):

x86, x86-64のLinuxの場合バイナリパッケージがあるので、http://nodejs.org/からダウンロードのリンクをコピーしてwgetできる。

詳しくはパッケージを解凍してできるREADME.mdを参照してください。

パッケージを解凍してできた```bin/```のディレクトリにパスが切られていれば使えます。

root権限でやってみる場合。

```
# cd /usr/local/src
# wget http://nodejs.org/dist/v0.10.32/node-v0.10.32-linux-x64.tar.gz
# cd /usr/local && tar --strip-components 1 -xzf \
>                          /usr/local/src/node-v0.10.32-linux-x64.tar.gz
-v0.10.32-linux-x64.tar.gz
```

npmでのモジュールのインストールは各個人で。やり方はMac OSXと同じ

```{sh}
$ npm install mqtt fs process
```

# サンプルうごかしてみました
小学生の日記レベルですいません。


## pub.js - publisher clientサンプル

MQTT.jsのサンプルをいじりました。
※topicの部分はsango.shiguredo.jpをちょっと意識してます。MQTTの仕様としては特に制限は無いので、publishしたtopicと同じであれば任意の文字列でかまいません。


```{node.js}
var mqtt = require('mqtt');
var fs = require('fs');
var process = require('process');

var cfg = JSON.parse(fs.readFileSync(process.env.HOME+'/.mqttcli.cfg', 'utf8'));

var host = cfg.host || 'localhost';
var port = cfg.port || 1883;

var client = mqtt.createClient(cfg.port, cfg.host, { username: cfg.username, password : cfg.password });

var topic= cfg.username+'/pubtest';

setInterval(function() {
  client.publish(topic, 'aaaa');
  client.publish(topic, Date.now().toString());
}, 1000);
```

設定ファイルはこんな感じ。githubにも<a href="https://github.com/kgbu/nodem9ttcli/blob/master/sample.mqttcli.cfg">sample.mqttcli.cfg</a>として上げておきました。

```{JSON}
{
  "host": "localhost",
  "port": "1883",
  "username": "kgbu",
  "password": "passwordstring"
}
```

とりあえずmqttcliのsubscriberで見てみると、、、

```
$ mqttcli/mqttcli sub -t "トピック/#" 
aaaa
1410979794228
aaaa
1410979795230
aaaa
1410979796231
aaaa
1410979797234
:
(以後１秒毎に繰り返す）
````

## sub.js - subscriber clientサンプル

```{javascript}
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
```

動かしてみます。sub.jsを起動してから、先の例と同じpub.jsを動かすと、mosquittoのclientと同様に動きます。（ちょっと表示がいじってあります）

```
$ node sub.js 
topic:message
kgbu/pubtest:aaaa
kgbu/pubtest:1411268401976
kgbu/pubtest:aaaa
kgbu/pubtest:1411268402984
kgbu/pubtest:aaaa
kgbu/pubtest:1411268403987
 :
```

この出力を、たとえば public_html/mqtt_text.htmlにリダイレクトすれば、、、

```
$ node sub.js > ~/public_html/mqtt_text.html
```

http://hoge.hoge/~username/mqtt_text.html の内容がどんどん変化していくのがわかります。

# TODOs - 難航しておりますw

## websocket経由ではどうか？

sangoはWebsocketでも繋がるので、試したくなるのは人情です。

### モジュールをインストール (OSX)

(2014.09.21時点ではまだここまでしかやってませんでした）

```{sh}
$ npm install socket.io
```


### サンプルが無い...

JavascriptでWebsocketでMQTT brokerに繫ぐサンプルはPahoにはありました。でも、node.jsではそれらしいものは見当たらず、、、考えてみれば、socket.ioにMQTTを組み込むってそのままではできない、その逆も、、、これはPahoを参考にモジュール修正するしかないかも、、楽しげw。

いやー、厳しい。全然違うコード体系だ。それでもやるべきことは、websocketのバイナリframeをサポートしていけばいい。プロトコル名とかはwebsocketだから違うわけでもなさげ

おそらくmqtt.jsでclientを作るところをいじれば良いはず。

```{javascript|MQTT.js/lib/mqtt.js}
     6	var net = require('net')
(中略）
    70	module.exports.createClient = function(port, host, opts) {
    71	  var builder, mqttClient;
    72	
(中略)
    89	  if (opts && opts.clean === false && !opts.clientId) {
    90	    throw new Error("Missing clientId for unclean clients");
    91	  }
    92	
    93	  builder = function() {
    94	    return net.createConnection(port, host);
    95	  };
    96	
    97	  mqttClient = new MqttClient(builder, opts);
    98	
    99	  return mqttClient;
   100	};
```
93行：net.createConnectionは普通にTCPの接続になっているようだ。http://nodejs.org/api/net.html#net_net_createconnection_options_connectionlistener
97行：でそれを引数にMqttClientをinstanciateしているが、これは


```
    9	  var MqttClient = require('./client');
```
であるから、client.jsを見ることになる。

```{MQTT.js/lib/client.js}
    34	var MqttClient = module.exports =
    35	function MqttClient(streamBuilder, options) {
    36	  var that = this;
    37	
    38	  if (!(this instanceof MqttClient)) {
    39	    return new MqttClient(streamBuilder, options);
    40	  }
     : (opitonの扱い)
    55	  this.streamBuilder = streamBuilder;
    56	
    57	  this._setupStream();
    58	
    59	  // Ping timer, setup in _setupPingTimer
    60	  this.pingTimer = null;
    61	  // Is the client connected?
    62	  this.connected = false;
    63	  // Packet queue
    64	  this.queue = [];
    65	  // Are we intentionally disconnecting?
    66	  this.disconnecting = false;
    67	  // Reconnect timer
    68	  this.reconnectTimer = null;
    69	  // MessageIDs starting with 1
    70	  this.nextId = Math.floor(Math.random() * 65535);
    71	
    72	  // Inflight messages
    73	  this.inflight = {
    74	    puback: {},
    75	    pubrec: {},
    76	    pubcomp: {},
    77	    suback: {},
    78	    unsuback: {}
    79	  };
    80	
    81	  // Incoming messages
    82	  this.incoming = {
    83	    pubrel: {}
    84	  };
    85	
    86	  // Mark connected on connect
    87	  this.on('connect', function() {
    88	    this.connected = true;
    89	  });
    90	
    91	  // Mark disconnected on stream close
    92	  this.on('close', function() {
    93	    this.connected = false;
    94	  });
    95	
    96	  // Setup ping timer
    97	  this.on('connect', this._setupPingTimer);
    98	
    99	  // Send queued packets
   100	  this.on('connect', function() {
   101	    var queue = that.queue
   102	      , length = queue.length;
   103	
   104	    for (var i = 0; i < length; i += 1) {
   105	      that._sendPacket(
   106	        queue[i].type,
   107	        queue[i].packet,
   108	        queue[i].cb
   109	      );
   110	    }
   111	    that.queue = [];
   112	  });
   113	
   114	
   115	  // Clear ping timer
   116	  this.on('close', function () {
   117	    if (that.pingTimer !== null) {
   118	      clearInterval(that.pingTimer);
   119	      that.pingTimer = null;
   120	    }
   121	  });
   122	
   123	  // Setup reconnect timer on disconnect
   124	  this.on('close', function() {
   125	    that._setupReconnect();
   126	  });
   127	
   128	  events.EventEmitter.call(this);
   129	};
   130	util.inherits(MqttClient, events.EventEmitter);
```

35 : MqttClientはStreamBuilderとして接続を受けている。ここをwebsocket受け取れるようにする、もしくは別クラスを定義する。
38 : キャッシュしたインスタンスを返すケース
57 : 接続をセットアップする_setupStream(137行)を呼び出し


```{mqtt.js/lib/client.js}
   137	MqttClient.prototype._setupStream = function() {
   138	  var that = this;
   139	
   140	  this._clearReconnect();
   141	
   142	  this.stream = this.streamBuilder();
   143	
   144	  // MqttConnection
   145	  this.conn = this.stream.pipe(new Connection());
```

142 : this.stream にTCP接続を代入している。

というわけで、connectionとsocket.ioを入れ替えるとした場合、大本のところで入れ替えることになるが、動作が同じかどうかは検証の必要がある。

streamが使われるところ

```{mqtt.js/lib/client.js}
   145	  this.conn = this.stream.pipe(new Connection());
   153	  this.stream.on('error', nop)
   156	  this.stream.on('close', this.emit.bind(this, 'close'));
   159	  this.stream.on('connect', function () {
   163	  this.stream.on('secureConnect', function () {
   433	    this.stream.destroy();
   435	    this.stream.end();
```

+ イベント (on..)
	- 'error'
	- 'close'
	- 'connect'
	- 'secureConnect'
+ pipe( Connection )
+ destroy()
+ end()


### そもそも 
http://wiki.eclipse.org/Paho/Paho_Websockets
http://tools.ietf.org/html/rfc6455 - websocket RFC

Pahoのドキュメントでは
Making MQTT over Websockets inter-operable:

- Must support WebSockets as defined by RFC 6455
- Must use websocket binary frames.
	- This enables MQTT v3,1 per the specification to flow over websockets with no change to the MQTT packets
- Must use "mqttv3.1" as the websocket protocol name.
	- This is applicable when creating the websocket: e.g. new WebSocket(wsurl, 'mqttv3.1')
- The path portion of the url specified on the MQTT connect should be "mqtt"
    For instance ws://m2m.eclipse.org:800/mqtt . ```mqtt``` should be the default with the option for an alternative to be configured / specified


となっている。



# 参考文献　肩に乗せてもらった巨人達
http://wiki.eclipse.org/Paho/Paho_Websockets - PahoのMQTT Websocket clientドキュメント
http://tools.ietf.org/html/rfc6455 - websocket RFC
http://yosuke-furukawa.hatenablog.com/entry/2014/05/30/093103 - Socket.IO 1.0の紹介 (翻訳)
http://blog.wnotes.net/blog/article/nodejs-socketio-summary (socket.ioの使い方)
http://d.hatena.ne.jp/yudetamago_orz/20120109/1326037157 (net.connectの使い方）

