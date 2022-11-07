/// <reference types="node" />
/// <reference types="node" />
import * as net from 'net';
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
export declare class TcpClient extends events.EventEmitter {
    private client;
    private rebootTimer;
    private heartTimer;
    private connOption;
    private reboostDelay;
    private heartDelay;
    private rebootTimes;
    private isReboot;
    private customMsg;
    constructor(opt?: net.NetConnectOpts);
    private initSocket;
    private messageHandler;
    private errorHandler;
    private rebootClient;
    private heart;
    formartData(cmd: Cmd, dataType: DataStreamType, data: any): string;
    setClientOptions(opt: TcpClientOptions): void;
    sendJSON(cmd: Cmd, type: DataStreamType, data: any): any;
    send(data: any): any;
}
