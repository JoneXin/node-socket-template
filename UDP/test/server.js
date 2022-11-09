const { Udp, DataStreamType, Cmd } = require('../dist/app');

const udpServer = new Udp(54545);

udpServer.on('data', (data) => {
    console.log(data);
    udpServer.sendJSON({ cmd: Cmd.DATA, type: DataStreamType.JSON, data: '收到消息了' }, 54546);
});

udpServer.on('error', (err) => {
    console.log(err);
});
