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
