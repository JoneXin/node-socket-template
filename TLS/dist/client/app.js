"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TlsClient = exports.SOCKET_OPTIONS = exports.DataStreamType = exports.Cmd = void 0;
const tls = require("tls");
const fs = require("fs");
const path = require("path");
const events = require("events");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const KEY = fs.readFileSync(path.join(__dirname, '../../keys/client.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../../keys/client.crt'));
const CA = fs.readFileSync(path.join(__dirname, '../../keys/ca.crt'));
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
// 启动配置
exports.SOCKET_OPTIONS = {
    port: 9009,
};
const OPTIONS = {
    key: KEY,
    cert: CERT,
    ca: [CA],
};
class TlsClient extends events.EventEmitter {
    constructor(port, host, opt) {
        super();
        this.client = {};
        this.connOption = {};
        this.reboostDelay = 4000;
        this.heartDelay = 2000;
        this.rebootTimes = Infinity;
        this.isReboot = true;
        this.customMsg = false; // 是否自定义消息格式 默认内置JSON格式
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
        // 连接错误处理
        this.errorHandler = (err) => {
            this.heartTimer && clearInterval(this.heartTimer);
            this.client.destroy();
            this.emit('error', err);
        };
        this.port = port || 9009;
        this.host = host || 'localhost';
        this.connOption = opt || OPTIONS;
        this.initSocket();
    }
    initSocket() {
        this.client = tls.connect(this.port, this.host, this.connOption, () => {
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
        // 重新连接
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
    // 格式化信息
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
    /**
     *  发送消息
     * @param cmd 消息体类型
     * @param type data类型
     * @param data 数据
     * @returns boolean
     */
    sendJSON(cmd, type, data) {
        return this.client.write(this.formartData(cmd, type, data));
    }
    // 自定义 数据结构的发送事件
    send(data) {
        return this.client.write(data);
    }
}
exports.TlsClient = TlsClient;
//# sourceMappingURL=app.js.map