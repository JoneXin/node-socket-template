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
