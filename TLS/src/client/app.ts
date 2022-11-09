import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const KEY = fs.readFileSync(path.join(__dirname, '../../keys/client.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../../keys/client.crt'));
const CA = fs.readFileSync(path.join(__dirname, '../../keys/ca.crt'));

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

// 启动配置
export const SOCKET_OPTIONS = {
    port: 9009,
};

export interface TcpClientOptions {
    reboostDelay?: number;
    heartDelay?: number;
    rebootTimes?: number;
    isReboot?: boolean;
    customMsg?: boolean;
}

const OPTIONS = {
    key: KEY,
    cert: CERT,
    ca: [CA],
};

export class TlsClient extends events.EventEmitter {
    private client: tls.TLSSocket | any = {};
    private rebootTimer: any;
    private heartTimer: any;
    private connOption: tls.ConnectionOptions = {};
    private port: number;
    private host: string;

    private reboostDelay = 4000;
    private heartDelay = 2000;
    private rebootTimes: number = Infinity;
    private isReboot: boolean = true;
    private customMsg: boolean = false; // 是否自定义消息格式 默认内置JSON格式

    constructor(port?: number, host?: string, opt?: tls.ConnectionOptions) {
        super();
        this.port = port || 9009;
        this.host = host || 'localhost';
        this.connOption = opt || OPTIONS;

        this.initSocket();
    }

    private initSocket() {
        this.client = tls.connect(this.port, this.host, this.connOption, () => {
            console.log('client init success!');
        });

        this.client.on('data', (data: any) => this.messageHandler.call(this, data));
        this.client.on('error', (error: any) => this.errorHandler.call(this, error));
        this.client.on('close', () => this.rebootClient.call(this));

        this.heart();
    }

    private messageHandler = (msg: string) => {
        try {
            if (this.customMsg) {
                return this.emit('data', msg);
            }

            const { cmd, type, data } = JSON.parse(msg);
            if (cmd == Cmd.HEART) return console.debug('收到心跳');
            this.emit('data', cmd, type, data);
        } catch (_) {
            console.error(_);
            this.emit('error', _);
        }
    };

    // 连接错误处理
    private errorHandler = (err: any) => {
        this.heartTimer && clearInterval(this.heartTimer);
        this.client.destroy();
        this.emit('error', err);
    };

    private rebootClient() {
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

    private heart() {
        this.heartTimer = setInterval(() => {
            this.sendJSON(Cmd.HEART, DataStreamType.JSON, 1);
        }, this.heartDelay);
    }

    // 格式化信息
    public formartData(cmd: Cmd, dataType: DataStreamType, data: any): string {
        try {
            return JSON.stringify({ cmd, type: dataType, data });
        } catch (_) {
            this.emit('error', _);
            return '';
        }
    }

    public setClientOptions(opt: TcpClientOptions) {
        this.customMsg = opt.customMsg || false;
    }

    /**
     *  发送消息
     * @param cmd 消息体类型
     * @param type data类型
     * @param data 数据
     * @returns boolean
     */
    public sendJSON(cmd: Cmd, type: DataStreamType, data: any) {
        return this.client.write(this.formartData(cmd, type, data));
    }

    // 自定义 数据结构的发送事件
    public send(data: any) {
        return this.client.write(data);
    }
}
