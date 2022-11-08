import * as dgram from 'dgram';
import * as events from 'events';
import { MsgDataStruct } from '../typing';

export class UdpClient extends events.EventEmitter {
    private client: dgram.Socket;

    constructor() {
        super();
        this.initClient();
    }

    initClient() {
        this.client = dgram.createSocket('udp4');
    }

    close() {
        this.client.close();
    }

    sendJSON(str: MsgDataStruct, port: number, ip?: string) {
        try {
            const msg = Buffer.from(JSON.stringify(str));
            this.client.send(msg, msg.length, 0, port, ip || 'localhost', (err, bytes) => {
                if (err) {
                    return this.emit('error', err);
                }
                
            });
        } catch (_) {
            this.emit('error', _);
        }
    }

    send(buf: Buffer, offset: number, port: number, ip?: string) {
        this.client.send(buf, buf.length, offset, port, ip || 'localhost', (err, bytes) => {
            if (err) {
                return this.emit('error', err);
            }
        });
    }
}
