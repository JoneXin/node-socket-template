import * as net from 'net';
import * as events from 'events';

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

export class TcpServer extends events.EventEmitter {
    private server: net.Server;
    private serverOpt: net.ServerOpts;
    private port: number = 9009;
    private customMsg: boolean = false; // 是否自定义消息格式 默认内置JSON格式

    constructor(port?: number, opt?: net.ServerOpts) {
        super();
        this.port = port || this.port;
        this.serverOpt = opt || {};

        this.server = net.createServer(this.serverOpt, (socket) => {
            console.log('client connect!');

            socket.on('data', (msg: any) => this.messageHandler.call(this, msg, socket));
            socket.on('error', (err) => this.errorHandler.call(this, err, socket));
            socket.on('end', () => this.connEndHander.call(this, socket));
        });

        this.server.listen(port || 9009, () => {
            console.log('server start');
        });
    }

    private messageHandler = (msg: any, socket: net.Socket) => {
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
    private errorHandler = (err: Error, socket: net.Socket) => {
        this.emit('error', err, socket);
    };

    // 断开连接处理
    private connEndHander = (socket: net.Socket) => {
        console.warn('连接断开');
    };

    private heartReplay(socket: net.Socket) {
        console.debug('收到心跳');
        this.sendJSON({ cmd: Cmd.HEART, type: DataStreamType.JSON, data: 'heart reply' }, socket);
    }

    // 格式化信息
    private formartData(cmd: Cmd, type: DataStreamType, data: any, socket: net.Socket): string {
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

    public sendJSON({ cmd, type, data }: MsgDataStruct, socket: net.Socket) {
        return socket.write(this.formartData(cmd, type, data, socket));
    }

    // 自定义 数据结构的发送事件
    public send(data: any, socket: net.Socket) {
        return socket.write(data);
    }
}
