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
