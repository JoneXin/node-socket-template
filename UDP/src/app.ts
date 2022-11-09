import * as dgram from 'dgram';
import * as events from 'events';

// 消息类型
export enum Cmd {
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

export class Udp extends events.EventEmitter {
    private customMsg: boolean = false; // 是否自定义消息格式 默认内置JSON格式
    private server: dgram.Socket;
    private port: number = 0;

    constructor(port?: number) {
        super();
        this.port = port || this.port;
        this.initServer();
    }

    initServer() {
        this.server = dgram.createSocket('udp4');
        this.server.on('listening', () => {
            console.debug(
                `running in addr:${this.server.address().address}, port: ${this.server.address().port || 'NULL'}`,
            );
        });
        this.server.on('message', (data) => this.handleData.call(this, data));
        this.server.on('error', (err) => this.handleError.call(this, err));

        if (this.port) this.server.bind(this.port);
    }

    close() {
        this.server.close();
    }

    handleData(data: any) {
        if (this.customMsg) return this.emit('data', data);
        const jsonData = JSON.parse(data);
        this.emit('data', jsonData);
    }

    handleError(error: any) {
        this.emit('error', error);
    }

    sendJSON(str: MsgDataStruct, port: number, ip?: string) {
        try {
            const msg = Buffer.from(JSON.stringify(str));
            this.server.send(msg, 0, msg.length, port, ip || 'localhost', (err, bytes) => {
                if (err) {
                    return this.emit('error', err);
                }
            });
        } catch (_) {
            this.emit('error', _);
        }
    }

    send(buf: Buffer, offset: number, port: number, ip?: string) {
        this.server.send(buf, offset, buf.length, port, ip || 'localhost', (err, bytes) => {
            if (err) {
                return this.emit('error', err);
            }
        });
    }
}
