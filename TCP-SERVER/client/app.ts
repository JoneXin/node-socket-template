import net, { NetConnectOpts, Socket } from 'net';
import events from 'events';

// 消息类型
enum Cmd {
    HEART = 'heart',
    DATA = 'data',
    END = 'end',
}
// 数据流 data 类型
enum DataStreamType {
    JSON = 'json',
    IMG = 'img',
    HTML = 'html',
}

// 消息体json结构
interface MsgDataStruct {
    cmd: Cmd;
    type: DataStreamType;
    data: any;
}

// 启动配置
const SOCKET_OPTIONS = {
    port: 9009,
    // host: '127.0.0.1',
};

class TcpClient extends events.EventEmitter {
    private client: Socket;
    private rebootTimer: any;
    private heartTimer: any;
    private reboostDelay = 4000;
    private heartDelay = 2000;
    private connOption: NetConnectOpts;
    private rebootTimes: number = 20;
    private isKeepReboot: boolean = true;

    constructor(opt?: NetConnectOpts) {
        super();
        this.connOption = { ...SOCKET_OPTIONS, ...(opt || {}) };
        this.client = net.createConnection(this.connOption, () => {
            console.log('client init success!');

            this.client.on('data', this.messageHandler.bind(this));
            this.client.on('error', this.errorHandler.bind(this));
            this.client.on('end', this.connEndHander.bind(this));

            this.heart();
        });
    }

    private messageHandler = (msg: string) => {
        try {
            const { cmd, type, data } = JSON.parse(msg);
            // 根据cmd处理业务逻辑
            this.emit('msg', cmd, type, data);
        } catch (_) {
            console.error(_);
            this.emit('msg_error', _);
        }
    };

    // 连接错误处理
    private errorHandler = (err: Error) => {
        console.error(err);
        this.emit('conn_error', err);
        // 重新连接
        this.rebootTimer || clearInterval(this.rebootTimer);
        this.heartTimer || clearInterval(this.heartTimer);
        if (this.isKeepReboot) {
            return this.rebootClient();
        }
        if (this.rebootTimes-- > 0) {
            this.rebootClient();
            console.debug(`剩余重启次数: ${this.rebootTimes}`);
        }
    };

    private rebootClient() {
        this.rebootTimer = setTimeout(() => {
            console.debug('发生错误，重启中！');
            new TcpClient(this.connOption);
        }, this.reboostDelay);
    }

    // 断开连接处理
    private connEndHander = () => {
        console.warn('连接断开');
    };

    private heart() {
        this.heartTimer = setInterval(() => {
            console.log(1);

            this.client.write(
                this.formartData(Cmd.HEART, DataStreamType.JSON, 1)
            );
        }, this.heartDelay);
    }

    // 格式化信息
    public formartData(cmd: Cmd, dataType: DataStreamType, data: any): string {
        try {
            return JSON.stringify({ cmd, type: dataType, data });
        } catch (_) {
            return '';
        }
    }

    /**
     *  发送消息
     * @param cmd 消息体类型
     * @param type data类型
     * @param data 数据
     * @returns boolean
     */
    public send(cmd: Cmd, type: DataStreamType, data: any) {
        return this.client.write(this.formartData(cmd, type, data));
    }
}

let clinet = new TcpClient();
clinet.on('msg', (cmd: Cmd, dataType: DataStreamType, data: any) => {});
