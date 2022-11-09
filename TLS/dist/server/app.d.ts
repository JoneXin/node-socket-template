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
export interface TcpClientOptions {
    customMsg?: boolean;
}
export declare class TlsServer extends events.EventEmitter {
    private server;
    private serverOpt;
    private port;
    private customMsg;
    constructor(port?: number, opt?: tls.TlsOptions);
    private messageHandler;
    private errorHandler;
    private connEndHander;
    private heartReplay;
    private formartData;
    setServerOptions(opt: TcpClientOptions): void;
    sendJSON({ cmd, type, data }: MsgDataStruct, socket: tls.TLSSocket): boolean;
    send(data: any, socket: tls.TLSSocket): boolean;
}
