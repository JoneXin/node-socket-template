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