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
export interface TcpClientOptions {
    customMsg?: boolean;
}
export declare class TcpServer extends events.EventEmitter {
    private server;
    private serverOpt;
    private port;
    private customMsg;
    constructor(port?: number, opt?: net.ServerOpts);
    private messageHandler;
    private errorHandler;
    private connEndHander;
    private heartReplay;
    private formartData;
    setServerOptions(opt: TcpClientOptions): void;
    sendJSON({ cmd, type, data }: MsgDataStruct, socket: net.Socket): boolean;
    send(data: any, socket: net.Socket): boolean;
}
