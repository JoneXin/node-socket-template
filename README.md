## node 不同socket 模块模板

### 包括: TCP, UDP, TLS, WS, HTTPS

## 目录结构
```txt
node-socket-template
 ├─ TCP
 │ ├─ dist // 打包位置
 │ │
 │ ├─ src
 │ │ ├─ client
 │ │ │ └─ app.ts // tcp client source code
 │ │ └─ server
 │ │ │ └─ app.ts // tcp server source code
 │ ├─ test
 │ │ ├─ client.js
 │ │ └─ server.js
 │ └─ tsconfig.json
 ├─ .prettierrc
 ├─ package.json
 ├─ README.md
 └─ tsconfig.json

```

## 1,TCP 客户端 与 服务端

> 启动客户端 与服务端案例

```json
 "start:tcp-server": "cd ./TCP & tsc & node ./test/server.js",
 "start:tcp-client": "cd ./TCP & tsc & node ./test/client.js",
 "build:tcp": "cd ./TCP & tsc"
```

#### 1.1， client
> 使用内置 json 消息体传递格式

```js
lconst { TcpClient } = require('../dist/client/app');

let client = new TcpClient();

client.on('data', (data) => {
    console.log(data);
});

client.on('error', (err) => {
    console.log(err, '--000--');
});

client.on('reboot', ({ rebootTimes, isReboot }) => {
    console.log('reboot', '重启次数：', rebootTimes, '是否开启重启：', isReboot);
});


```
> 自定义格式

```js

const { TcpClient } = require('../dist/client/app');
clinet.setClientOptions({
    customMsg: true,
});

let client = new TcpClient();

client.on('data', (data) => {
    console.log(data);
});

client.on('error', (err) => {
    console.log(err, '--000--');
});

client.on('reboot', ({ rebootTimes, isReboot }) => {
    console.log('reboot', '重启次数：', rebootTimes, '是否开启重启：', isReboot);
});


setInterval(() => {
    clinet.send('案件十大');
    clinet.send(Buffer.from([2, 2, 1]));
}, 2000);
```

#### 1.2, server


```js
const { TcpServer } = require('../dist/server/app');

const server = new TcpServer();

server.on('data', (msg, socket) => {
    const { cmd, type, data } = msg;
    console.log(cmd, type, data);
    server.sendJSON({ cmd: Cmd.DATA, type: DataStreamType.JSON, data: '收到！' }, socket);
});

server.on('error', (err, socket) => {
    console.log(err);
});

```

## 2，UDP

> UDP 是面向事务的简单不可靠通信，在网络差的环境丢包严重，特点是无连接，资源消耗低，快速灵活， 适用于丢包影响不大的场景，比如，音视频。DNS服务基于UDP实现

> UDP 既可以做服务端，也可以做客户端，要实现接受消息，必须绑定端口，接收其他的UDP节点发送的消息，如果只要发送消息，不需要绑定端口。

### 2.1，UDP 客户端
#### /UDP/test/client.js

> 这里于要互传，所以客客户端也绑定端口

```js
const { Udp, DataStreamType, Cmd } = require('../dist/app');

const udpClient = new Udp(54546);

udpClient.on('data', (data) => {
    console.log(data);
});

udpClient.on('error', (err) => {
    console.log(err);
});

setInterval(() => {
    udpClient.sendJSON({ cmd: Cmd.DATA, type: DataStreamType.JSON, data: '131' }, 54545);
}, 3000);

```

### 2.2，UDP 服务端
#### /UDP/test/server.js

```js
const { Udp, DataStreamType, Cmd } = require('../dist/app');

const udpServer = new Udp(54545);

udpServer.on('data', (data) => {
    console.log(data);
    udpServer.sendJSON({ cmd: Cmd.DATA, type: DataStreamType.JSON, data: '收到消息了' }, 54546);
});

udpServer.on('error', (err) => {
    console.log(err);
});

```