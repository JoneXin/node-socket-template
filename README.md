## node 不同socket 模块模板

### 包括: TCP, UDP, TLS, WS, HTTPS

## 目录结构
```txt
node-socket-template
 ├─ TCP
 │ ├─ dist
 │ ├─ src
 │ │ ├─ client
 │ │ │ └─ app.ts
 │ │ └─ server
 │ │ │ └─ app.ts
 │ ├─ test
 │ │ ├─ client.js
 │ │ └─ server.js
 │ └─ tsconfig.json
 ├─ UDP
 │ ├─ dist
 │ ├─ src
 │ │ └─ app.ts
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

// 传输接收 是buffer
//clinet.setClientOptions({
//    customMsg: true,
//});

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

#### 1.2, server


```js
const { TcpServer } = require('../dist/server/app');

const server = new TcpServer();

// 传输接收 直接是buffer
//server.setClientOptions({
//    customMsg: true,
//});

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

## 3，TLS（加密的TCP数据传输）

### TLS/SSL:
> TLS加密基于 公私钥的基础上的非对称结构，服务端，客户端都拥有自己的私钥，用公钥加密传输内容，用私钥解密传输内容。

### 下载 openssl 两篇博客按流程就行
- windows
> https://www.cnblogs.com/dingshaohua/p/12271280.html

- .unix
> $: brew install openssl

传输流程:
- 交换公钥
> 1, 客户端---> 客户端公钥 ---> 传输 ----> 服务端接受客户端公钥
> 2, 服务端---> 服务端公钥 ---> 传输 ----> 客户端接受服务端公钥

- 加密传输

> 1, 客户端 -->数据(服务端公钥加密) --> 服务端通过自己的私钥解密
> 2, 服务端 -->数据(客户端公钥加密) --> 客户端通过自己的私钥解密

node 通过openssl 实现，生成秘钥流程：
- 生成私钥
```shell
    // 生成 1024 长度的服务端私钥
    openssl genrsa -out server.key 1024

    // 生成 1024 长度的客户端私钥
    openssl genrsa -out client.key 1024
```

- 通过私钥生成公钥

```shell
    // 生成服务端公钥
    openssl rsa -in server.key -pubout -out server.pem

     // 生成客户端公钥
    openssl rsa -in client.key -pubout -out server.pem
```

- 认证公钥（为什么要认证可以google一下，反正就是为了防止中间窃取）

这里就不用CA申请的数字证书了，直接自己自己颁发一拨
> 1, 生成 根证书（模拟CA）

```
    openssl genrsa -out ca.key 1024
    openssl req -new -key ca.key -out ca.csr
    openssl x509 -req -in ca.csr -signkey ca.key -out ca.crt    
```
> 2, 根据 根证书给服务端和客户单的私钥签名

```shell
    // 给私钥生成 服务端 数字证书  (签名)
    openssl req -new -key server.key -out server.csr
    openssl x509 -req -CA ca.csr -CAkey ca.key -CAcreateserial -in server.csr -out server.crt

    // 给私钥生成 客户端 数字证书  (签名)
    openssl req -new -key client.key -out client.csr
    openssl x509 -req -CA ca.csr -CAkey ca.key -CAcreateserial -in client.csr -out client.crt
```

- node 代码模板

这里通过快捷键生成申述流程:

```shell
    1, npm run gen_ca_crt 生成CA跟证书
    2, npm run gen_client_rsa 客户端: 生成公私钥并签名
    3, npm run gen_server_rsa 服务端: 生成公私钥并签名
```
秘钥目录: /TLS/keys/...

- 客户端示例(模板实例跟TCP 本质一样，就是加了一层 TLS/SSL)

```js
const { TlsClient } = require('../dist/client/app');

const tlsClient = new TlsClient(12341);

tlsClient.on('data', (data) => {
    console.log(data);
});

tlsClient.on('error', (err) => {
    console.log(err, '--000--');
});

tlsClient.on('reboot', ({ rebootTimes, isReboot }) => {
    console.log('reboot', '重启次数：', rebootTimes, '是否开启重启：', isReboot);
});


```

- 服务端示例

```js

const { TlsServer } = require('../dist/server/app');
const tlsServer = new TlsServer(12341);

tlsServer.on('data', (msg, socket) => {
    const { cmd, type, data } = msg;
    console.log(cmd, type, data);
    server.sendJSON({ cmd: Cmd.DATA, type: DataStreamType.JSON, data: '收到！' }, socket);
});

tlsServer.on('error', (err, socket) => {
    console.log(err);
});

```