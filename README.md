## 读《深入浅出node》有感

## 目录结构
```txt
node-socket-template
 ├─ HTTP-SERVER HTTP服务器模版
 ├─ HTTPS-SERVER HTTPS 、服务器模版
 ├─ TCP-SERVER TCP服务器，客户端模版
 ├─ TLS-SERVER TLS服务端，客户端模版
 ├─ UDP-SERVER UDP服务端，客户端模版
 ├─ WS-SERVER websocket 服务端，客户端模版
 └─ README.md
```

### 1，node tcp client and server

#### 1.1， client
> 使用内置 json 格式

```js
let clinet = new TcpClient();

clinet.on('data', (cmd: Cmd, dataType: DataStreamType, data: any) => {
    console.log(cmd, dataType, data);
});

clinet.on('err', err => {
    console.log(err);
});

clinet.on('reboot', (rebootTimes: number, isKeepReboot: boolean) => {
    console.log(rebootTimes, isKeepReboot);
});

// 内置json结构格式发送
setInterval(() => {
    clinet.sendJSON(Cmd.DATA, DataStreamType.JSON, '案件十大');
}, 2000);

```
> 自定义格式

```js
let clinet = new TcpClient();
clinet.setClientOptions({
    customMsg: true,
});

clinet.on('data', (data: any) => {
    console.log(data);
});

clinet.on('err', err => {
    console.log(err);
});

clinet.on('reboot', (rebootTimes: number, isKeepReboot: boolean) => {
    console.log(rebootTimes, isKeepReboot);
});

// 内置json结构格式发送
setInterval(() => {
    clinet.send('案件十大');
    clinet.send(Buffer.from([2, 2, 1]));
}, 2000);
```

#### 1.2, server