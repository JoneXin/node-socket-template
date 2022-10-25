import net, { NetConnectOpts, Socket } from 'net';

// 消息类型
enum Cmd {
    HEART = "heart",
    DATA = "data",
    END = "end"
}
// 传递的流 类型
enum DataStreamType {
    JSON = "json",
    IMG = 'img',
    HTML = 'html'
}

interface MsgDataStruct {
    cmd: Cmd,
    type: DataStreamType,
    data: any
}

const SOCKET_OPTIONS = {
    port: 9009,
    host: '127.0.0.1'
}

class TcpClient {

    private client: Socket;
    private rebootTimer: NodeJS.Timer | string = '';
    private heartTimer: NodeJS.Timer | string = '';
    private reboostDelay = 4000;
    private heartDelay = 2000;
    private connOption: NetConnectOpts;

    constructor(opt?: NetConnectOpts) {
        this.connOption = { ...SOCKET_OPTIONS, ...opt || {} };
        this.client = net.createConnection(this.connOption, () => {
            console.log('client init success!');

            this.client.on('data', this.messageHandler.bind(this));
            this.client.on('error', this.errorHandler.bind(this));
            this.client.on('end', this.connEndHander.bind(this));

            this.heart();
        })
    }

    messageHandler = (msg: string) => {
        try {
            const { cmd, type, data } = JSON.parse(msg);
            // 根据cmd处理业务逻辑
            console.log(cmd, type, data);

        } catch (_) {
            console.error(_);
        }
    };

    errorHandler = (err: Error) => {
        console.error(err);
        // 重新连接
        this.rebootTimer || clearInterval(this.rebootTimer);
        this.heartTimer || clearInterval(this.heartTimer);
        this.rebootTimer = setInterval(() => {
            console.debug('发生错误，重启中！')
            new TcpClient(this.connOption);
        }, this.reboostDelay)
    };

    connEndHander = () => {
        console.warn("连接断开");
    };

    heart() {
        this.heartTimer = setInterval(() => {
            this.client.write(this.formartData(Cmd.HEART, DataStreamType.JSON, 1));
        }, this.heartDelay)
    }

    // 格式化信息
    formartData(cmd: Cmd, dataType: DataStreamType, data: any): string {
        try {
            return JSON.stringify({ cmd, dataType, data });
        } catch (_) {
            return '';
        };
    }
}

new TcpClient();