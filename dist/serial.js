"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SerialPort = require("serialport");
class Serial {
    constructor() {
        this.isReady = false;
        this.list();
    }
    list() {
        return __awaiter(this, void 0, void 0, function* () {
            return SerialPort.list()
                .then((ports) => {
                for (const port of ports) {
                    if (port.productId != null) {
                        console.log('[serial] Using serial:', port);
                        this.serial = new SerialPort(port.comName, {
                            baudRate: 9600,
                            autoOpen: false
                        });
                        break;
                    }
                }
                if (this.serial == null) {
                    console.error('[serial] No serial port available, retry in 5s');
                    setTimeout(() => { this.list(); }, 5000);
                }
                else {
                    this.serial.on('open', () => {
                        this.isReady = true;
                        console.log('[serial] Serial opened');
                    });
                    this.serial.on('close', () => {
                        this.isReady = false;
                        console.log('[serial] Serial closed, reopening in 3s');
                        setTimeout(() => { this.list(); }, 3000);
                        this.serial.removeAllListeners();
                        this.serial = null;
                    });
                    this.serial.on('error', (e) => {
                        console.error('[serial] Error occourred:', e);
                    });
                    this.serial.on('data', (data) => {
                        console.log('[serial] New data:', data);
                        this.solutionEnded();
                        // if (data === 'e') {
                        // }
                    });
                    this.openSerial()
                        .catch((e) => {
                        console.log('[serial] Error opening serial, retrying in 5s');
                        setTimeout(() => { this.list(); }, 5000);
                        this.serial.removeAllListeners();
                    });
                }
            })
                .catch((e) => {
                console.error('[serial] Error listing serial ports:', e);
            });
        });
    }
    openSerial() {
        return new Promise((resolve, reject) => {
            this.serial.open((e) => {
                if (e != null) {
                    console.error(e);
                    reject(e);
                }
                else {
                    resolve();
                }
            });
        });
    }
    waitSolutionCompleted(callback) {
        this.solutionEnded = callback;
    }
    send(data) {
        return new Promise((resolve, reject) => {
            if (!this.isReady) {
                reject('Serial port not ready');
            }
            this.serial.write(data, (e, bytesWritten) => {
                if (e) {
                    reject(e);
                }
                else {
                    console.log('[serial] Sending:', data);
                    resolve(bytesWritten);
                }
            });
        });
    }
}
exports.Serial = Serial;
