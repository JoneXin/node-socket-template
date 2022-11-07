"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpClient = exports.SOCKET_OPTIONS = exports.DataStreamType = exports.Cmd = void 0;
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
exports.SOCKET_OPTIONS = {
    port: 9009,
};
class TcpClient extends events.EventEmitter {
    constructor(opt) {
        super();
        this.client = {};
        this.reboostDelay = 4000;
        this.heartDelay = 2000;
        this.rebootTimes = Infinity;
        this.isReboot = true;
        this.customMsg = false;
        this.messageHandler = (msg) => {
            try {
                if (this.customMsg) {
                    return this.emit('data', msg);
                }
                const { cmd, type, data } = JSON.parse(msg);
                if (cmd == Cmd.HEART)
                    return console.debug('收到心跳');
                this.emit('data', cmd, type, data);
            }
            catch (_) {
                console.error(_);
                this.emit('error', _);
            }
        };
        this.errorHandler = (err) => {
            this.heartTimer && clearInterval(this.heartTimer);
            this.client.destroy();
            this.emit('error', err);
        };
        this.connOption = Object.assign(Object.assign({}, exports.SOCKET_OPTIONS), (opt || {}));
        this.initSocket();
    }
    initSocket() {
        this.client = net.createConnection(this.connOption, () => {
            console.log('client init success!');
        });
        this.client.on('data', (data) => this.messageHandler.call(this, data));
        this.client.on('error', (error) => this.errorHandler.call(this, error));
        this.client.on('close', () => this.rebootClient.call(this));
        this.heart();
    }
    rebootClient() {
        this.rebootTimes--;
        if (!this.isReboot) {
            return this.emit('reboot', {
                rebootTimes: this.rebootTimes,
                isKeepReboot: this.isReboot,
            });
        }
        if (this.rebootTimes < 0) {
            return this.emit('reboot', {
                rebootTimes: this.rebootTimes,
                isKeepReboot: this.isReboot,
            });
        }
        this.rebootTimer && clearTimeout(this.rebootTimer);
        this.rebootTimer = setTimeout(() => {
            console.debug('发生错误，重启中！');
            this.initSocket();
        }, this.reboostDelay);
        this.emit('reboot', {
            rebootTimes: this.rebootTimes,
            isReboot: this.isReboot,
        });
    }
    heart() {
        this.heartTimer = setInterval(() => {
            this.sendJSON(Cmd.HEART, DataStreamType.JSON, 1);
        }, this.heartDelay);
    }
    formartData(cmd, dataType, data) {
        try {
            return JSON.stringify({ cmd, type: dataType, data });
        }
        catch (_) {
            this.emit('error', _);
            return '';
        }
    }
    setClientOptions(opt) {
        this.customMsg = opt.customMsg || false;
    }
    sendJSON(cmd, type, data) {
        return this.client.write(this.formartData(cmd, type, data));
    }
    send(data) {
        return this.client.write(data);
    }
}
exports.TcpClient = TcpClient;
//# sourceMappingURL=app.js.map