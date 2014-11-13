Node.js で MQTT をコマンドラインで試してみるログ（2014/10/6に更新しました）

時雨堂さんがMQTTブローカーサービスhttp://sango.shiguredo.jp をリリースして以来、ちょっと元気がでたので、素振りと称してやっつけてますw

motivated by：http://null.ly/post/56517703680/apache-apollo-node-js-mqtt

とりあえずの置き場：github: https://github.com/kgbu/nodem9ttcli

## History
1. Draft : 2014/9/18
1. initial post on Qiita : 2014/9/21
1. Websocket使う例をmowsで追加しました： 2014/10/6

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

# TODOだったことなど、、、

## websocket経由ではどうか？結局MOWSのサンプル動かしました

sangoはWebsocketでも繋がるので、試したくなるのは人情です。
いろいろ自分でやってみようとしたのですが、結局は<a href="https://github.com/mcollina/mows">[mows]</a>のサンプルをどうぞ、ということになりました。

元のサンプルはここ参照：　https://github.com/mcollina/mows#on-node
(自分のサンプルではURLとport番号がカブっているのが気に入らないのですが...)

```
var ops = {username: 認証用ユーザー名,
      password: 認証用パスワード};
var mows   = require('mows')
  , client = mows.createClient(ポート番号,'ws://MQTTサーバー:ポート番号/mqtt',ops);

client.subscribe ('トピックのベース/#');
client.publish('トピックのベース/mowstest', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(topic, message);

  client.end();
});
```

実行結果

```
$ node mowspub.js
kgbu@github/mowstest Hello mqtt
```

## MQTT.jsとmowsの関係を理解したい
そもそもmowsはMQTT.jsをwebsocketで繫ぐ、ということで、自分も同じことをしようとして、MQTT.jsがstream使っているところへ<a href="https://github.com/einaros/ws">WS</a>のwebsocket出力をどう繫ごうかと考えていました。
実際にwebsocketへのupgradeまではできましたが、binaryのデータとしてMQTTのパケットを構築する部分は是非MQTT.jsのコードを利用したいと思ってコード読んでいましたが、疲れたので(w、MOWSにおすがりしましたw
mowsではそこを<a href="http://github.com/maxogden/websocket-stream.git">websocket-stream</a>を使っていました。
その実体は　https://github.com/maxogden/websocket-stream/blob/master/index.js にあり、勉強になりました。


# 参考文献　肩に乗せてもらった巨人達
http://wiki.eclipse.org/Paho/Paho_Websockets - PahoのMQTT Websocket clientドキュメント
http://tools.ietf.org/html/rfc6455 - websocket RFC
http://yosuke-furukawa.hatenablog.com/entry/2014/05/30/093103 - Socket.IO 1.0の紹介 (翻訳)
http://blog.wnotes.net/blog/article/nodejs-socketio-summary (socket.ioの使い方)
http://d.hatena.ne.jp/yudetamago_orz/20120109/1326037157 (net.connectの使い方）

