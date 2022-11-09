import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';

const KEY = fs.readFileSync(path.join(__dirname, '../../keys/server.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../../keys/server.crt'));
const CA = fs.readFileSync(path.join(__dirname, '../../keys/ca.crt'));

const OPTIONS = {
    key: KEY,
    cert: CERT,
    ca: [CA],
};

// 消息类型
export enum Cmd {
    HEART = 'heart',
    DATA = 'data',
    END = 'end',
}
// 数据流 data 类型
export enum DataStreamType {
    JSON = 'json',
    IMG = 'img',
    HTML = 'html',
    STREAM = 'stream',
}

// 消息体json结构
export interface MsgDataStruct {
    cmd: Cmd;
    type: DataStreamType;
    data: any;
}

export interface TcpClientOptions {
    customMsg?: boolean;
}

export class TlsServer extends events.EventEmitter {
    private server: tls.Server;
    private serverOpt: tls.TlsOptions;
    private port: number = 9009;
    private customMsg: boolean = false; // 是否自定义消息格式 默认内置JSON格式

    constructor(port?: number, opt?: tls.TlsOptions) {
        super();
        this.port = port || this.port;
        this.serverOpt = opt || OPTIONS;

        this.server = tls.createServer(this.serverOpt, (socket) => {
            console.log('client connect!');

            socket.on('data', (msg: any) => this.messageHandler.call(this, msg, socket));
            socket.on('error', (err) => this.errorHandler.call(this, err, socket));
            socket.on('end', () => this.connEndHander.call(this, socket));
        });

        this.server.listen(port || 9009, () => {
            console.log('server start');
        });
    }

    private messageHandler = (msg: any, socket: tls.TLSSocket) => {
        try {
            //  外部处理 所有连接信息
            if (this.customMsg) {
                return this.emit('data', msg, socket);
            }

            // 内部处理心跳
            const { cmd, type, data } = JSON.parse(msg);
            if (cmd == 'heart') return this.heartReplay(socket);
            this.emit('data', { cmd, type, data }, socket);
        } catch (_) {
            console.error(_);
            this.emit('error', _, socket);
        }
    };

    // 连接错误处理
    private errorHandler = (err: Error, socket: tls.TLSSocket) => {
        this.emit('error', err, socket);
    };

    // 断开连接处理
    private connEndHander = (socket: tls.TLSSocket) => {
        console.warn('连接断开');
    };

    private heartReplay(socket: tls.TLSSocket) {
        console.debug('收到心跳');
        this.sendJSON({ cmd: Cmd.HEART, type: DataStreamType.JSON, data: 'heart reply' }, socket);
    }

    // 格式化信息
    private formartData(cmd: Cmd, type: DataStreamType, data: any, socket: tls.TLSSocket): string {
        try {
            return JSON.stringify({ cmd, type, data });
        } catch (_) {
            this.emit('error', _, socket);
            return '';
        }
    }

    public setServerOptions(opt: TcpClientOptions) {
        this.customMsg = opt.customMsg || false;
    }

    public sendJSON({ cmd, type, data }: MsgDataStruct, socket: tls.TLSSocket) {
        return socket.write(this.formartData(cmd, type, data, socket));
    }

    // 自定义 数据结构的发送事件
    public send(data: any, socket: tls.TLSSocket) {
        return socket.write(data);
    }
}
