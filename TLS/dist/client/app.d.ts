/// <reference types="node" />
/// <reference types="node" />
import * as tls from 'tls';
import * as events from 'events';
export declare enum Cmd {
    HEART = "heart",
    DATA = "data",
    END = "end"
}
export declare enum DataStreamType {
    JSON = "json",
    IMG = "img",
    HTML = "html",
    STREAM = "stream"
}
export interface MsgDataStruct {
    cmd: Cmd;
    type: DataStreamType;
    data: any;
}
export declare const SOCKET_OPTIONS: {
    port: number;
};
export interface TcpClientOptions {
    reboostDelay?: number;
    heartDelay?: number;
    rebootTimes?: number;
    isReboot?: boolean;
    customMsg?: boolean;
}
export declare class TlsClient extends events.EventEmitter {
    private client;
    private rebootTimer;
    private heartTimer;
    private connOption;
    private port;
    private host;
    private reboostDelay;
    private heartDelay;
    private rebootTimes;
    private isReboot;
    private customMsg;
    constructor(port?: number, host?: string, opt?: tls.ConnectionOptions);
    private initSocket;
    private messageHandler;
    private errorHandler;
    private rebootClient;
    private heart;
    formartData(cmd: Cmd, dataType: DataStreamType, data: any): string;
    setClientOptions(opt: TcpClientOptions): void;
    /**
     *  发送消息
     * @param cmd 消息体类型
     * @param type data类型
     * @param data 数据
     * @returns boolean
     */
    sendJSON(cmd: Cmd, type: DataStreamType, data: any): any;
    send(data: any): any;
}
