"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SerialPort = require("serialport");
class Serial {
    constructor() {
        this.isReady = false;
        SerialPort.list()
            .then((ports) => {
            for (const port of ports) {
                if (port.productId != null) {
                    console.log('Opening serial:', port);
                    this.serial = new SerialPort(port.comName, {
                        baudRate: 9600
                    }, (e) => {
                        console.error(e);
                    });
                    this.serial.on('open', () => {
                        this.isReady = true;
                        console.log('Serial opened');
                    });
                    this.serial.on('close', () => {
                        this.isReady = false;
                        console.log('Serial closed');
                    });
                    break;
                }
            }
        })
            .catch((e) => {
            console.error(e);
        });
    }
    send(data) {
        return new Promise((resolve, reject) => {
            if (!this.isReady) {
                reject(new Error('Serial port not ready'));
            }
            this.serial.write(data, (e, bytesWritten) => {
                if (e) {
                    reject(e);
                }
                else {
                    console.log('[serial]', data);
                    resolve(bytesWritten);
                }
            });
        });
    }
}
exports.Serial = Serial;
