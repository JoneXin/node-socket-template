const net = require('net');

const init = () => {
    console.log('其他初始化操作');
};

const messageHandler = msg => {
    try {
        const { cmd, type, data } = JSON.parse(msg);
        console.log(cmd, type, data);
        // 根据cmd处理业务逻辑
    } catch (_) {
        console.err(_);
    }
};

const errorHandler = err => {
    console.error(err);
    console.warn('连接断开');
};

const connEndHander = () => {};

// 服务创建
const server = net.createServer(socket => {
    console.log(socket);
    socket.on('ready', init);
    socket.on('data', messageHandler);
    socket.on('error', errorHandler);
    socket.on('end', connEndHander);
});

server.listen(9009, () => {
    console.log('server start');
});
