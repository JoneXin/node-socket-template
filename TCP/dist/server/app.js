"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpServer = exports.DataStreamType = exports.Cmd = void 0;
const net = require("net");
const events = require("events");
var Cmd;
(function (Cmd) {
    Cmd["HEART"] = "heart";
    Cmd["DATA"] = "data";
    Cmd["END"] = "end";
})(Cmd = exports.Cmd || (exports.Cmd = {}));
var DataStreamType;
(function (DataStreamType) {
    DataStreamType["JSON"] = "json";
    DataStreamType["IMG"] = "img";
    DataStreamType["HTML"] = "html";
    DataStreamType["STREAM"] = "stream";
})(DataStreamType = exports.DataStreamType || (exports.DataStreamType = {}));
class TcpServer extends events.EventEmitter {
    constructor(port, opt) {
        super();
        this.port = 9009;
        this.customMsg = false;
        this.messageHandler = (msg, socket) => {
            try {
                if (this.customMsg) {
                    return this.emit('data', msg, socket);
                }
                const { cmd, type, data } = JSON.parse(msg);
                if (cmd == 'heart')
                    return this.heartReplay(socket);
                this.emit('data', { cmd, type, data }, socket);
            }
            catch (_) {
                console.error(_);
                this.emit('error', _, socket);
            }
        };
        this.errorHandler = (err, socket) => {
            this.emit('error', err, socket);
        };
        this.connEndHander = (socket) => {
            console.warn('连接断开');
        };
        this.port = port || this.port;
        this.serverOpt = opt || {};
        this.server = net.createServer(this.serverOpt, (socket) => {
            console.log('client connect!');
            socket.on('data', (msg) => this.messageHandler.call(this, msg, socket));
            socket.on('error', (err) => this.errorHandler.call(this, err, socket));
            socket.on('end', () => this.connEndHander.call(this, socket));
        });
        this.server.listen(port || 9009, () => {
            console.log('server start');
        });
    }
    heartReplay(socket) {
        console.debug('收到心跳');
        this.sendJSON({ cmd: Cmd.HEART, type: DataStreamType.JSON, data: 'heart reply' }, socket);
    }
    formartData(cmd, type, data, socket) {
        try {
            return JSON.stringify({ cmd, type, data });
        }
        catch (_) {
            this.emit('error', _, socket);
            return '';
        }
    }
    setServerOptions(opt) {
        this.customMsg = opt.customMsg || false;
    }
    sendJSON({ cmd, type, data }, socket) {
        return socket.write(this.formartData(cmd, type, data, socket));
    }
    send(data, socket) {
        return socket.write(data);
    }
}
exports.TcpServer = TcpServer;
//# sourceMappingURL=app.js.map