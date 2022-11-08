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
