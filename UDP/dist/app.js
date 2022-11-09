"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Udp = exports.DataStreamType = exports.Cmd = void 0;
const dgram = require("dgram");
const events = require("events");
var Cmd;
(function (Cmd) {
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
class Udp extends events.EventEmitter {
    constructor(port) {
        super();
        this.customMsg = false;
        this.port = 0;
        this.port = port || this.port;
        this.initServer();
    }
    initServer() {
        this.server = dgram.createSocket('udp4');
        this.server.on('listening', () => {
            console.debug(`running in addr:${this.server.address().address}, port: ${this.server.address().port || 'NULL'}`);
        });
        this.server.on('message', (data) => this.handleData.call(this, data));
        this.server.on('error', (err) => this.handleError.call(this, err));
        if (this.port)
            this.server.bind(this.port);
    }
    close() {
        this.server.close();
    }
    handleData(data) {
        if (this.customMsg)
            return this.emit('data', data);
        const jsonData = JSON.parse(data);
        this.emit('data', jsonData);
    }
    handleError(error) {
        this.emit('error', error);
    }
    sendJSON(str, port, ip) {
        try {
            const msg = Buffer.from(JSON.stringify(str));
            this.server.send(msg, 0, msg.length, port, ip || 'localhost', (err, bytes) => {
                if (err) {
                    return this.emit('error', err);
                }
            });
        }
        catch (_) {
            this.emit('error', _);
        }
    }
    send(buf, offset, port, ip) {
        this.server.send(buf, offset, buf.length, port, ip || 'localhost', (err, bytes) => {
            if (err) {
                return this.emit('error', err);
            }
        });
    }
}
exports.Udp = Udp;
//# sourceMappingURL=app.js.map