/// <reference types="node" />
/// <reference types="node" />
import * as events from 'events';
export declare enum Cmd {
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
export declare class Udp extends events.EventEmitter {
    private customMsg;
    private server;
    private port;
    constructor(port?: number);
    initServer(): void;
    close(): void;
    handleData(data: any): boolean;
    handleError(error: any): void;
    sendJSON(str: MsgDataStruct, port: number, ip?: string): void;
    send(buf: Buffer, offset: number, port: number, ip?: string): void;
}
