"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TlsServer = exports.DataStreamType = exports.Cmd = void 0;
const tls = require("tls");
const fs = require("fs");
const path = require("path");
const events = require("events");
const KEY = fs.readFileSync(path.join(__dirname, '../../keys/server.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../../keys/server.crt'));
const CA = fs.readFileSync(path.join(__dirname, '../../keys/ca.crt'));
const OPTIONS = {
    key: KEY,
    cert: CERT,
    ca: [CA],
};
// 消息类型
var Cmd;
(function (Cmd) {
    Cmd["HEART"] = "heart";
    Cmd["DATA"] = "data";
    Cmd["END"] = "end";
})(Cmd = exports.Cmd || (exports.Cmd = {}));
// 数据流 data 类型
var DataStreamType;
(function (DataStreamType) {
    DataStreamType["JSON"] = "json";
    DataStreamType["IMG"] = "img";
    DataStreamType["HTML"] = "html";
    DataStreamType["STREAM"] = "stream";
})(DataStreamType = exports.DataStreamType || (exports.DataStreamType = {}));
class TlsServer extends events.EventEmitter {
    constructor(port, opt) {
        super();
        this.port = 9009;
        this.customMsg = false; // 是否自定义消息格式 默认内置JSON格式
        this.messageHandler = (msg, socket) => {
            try {
                //  外部处理 所有连接信息
                if (this.customMsg) {
                    return this.emit('data', msg, socket);
                }
                // 内部处理心跳
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
        // 连接错误处理
        this.errorHandler = (err, socket) => {
            this.emit('error', err, socket);
        };
        // 断开连接处理
        this.connEndHander = (socket) => {
            console.warn('连接断开');
        };
        this.port = port || this.port;
        this.serverOpt = opt || OPTIONS;
        this.server = tls.createServer(this.serverOpt, (socket) => {
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
    // 格式化信息
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
    // 自定义 数据结构的发送事件
    send(data, socket) {
        return socket.write(data);
    }
}
exports.TlsServer = TlsServer;
//# sourceMappingURL=app.js.map