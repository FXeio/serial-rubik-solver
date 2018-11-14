import * as SerialPort from 'serialport';
import { resolve } from 'url';


export class Serial {

  private serial: SerialPort;
  public isReady: boolean = false;
  private solutionEnded;

  constructor() {
    this.list();
  }

  async list() {
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
          setTimeout(() => { this.list() }, 5000);
        } else {
          this.serial.on('open', () => {
            this.isReady = true;
            console.log('[serial] Serial opened');
          });
          this.serial.on('close', () => {
            this.isReady = false;
            console.log('[serial] Serial closed, reopening in 3s');
            setTimeout(() => { this.list() }, 3000);
            this.serial.removeAllListeners();
            this.serial = null;
          });
          this.serial.on('error', (e) => {
            console.error('[serial] Error occourred:', e);
          });
          this.serial.on('data', (data) => {
            console.log('[serial] New data:', data);
            if (data === 'e') {
              this.solutionEnded();
            }
          });
          this.openSerial()
            .catch((e) => {
              console.log('[serial] Error opening serial, retrying in 5s');
              setTimeout(() => { this.list() }, 5000);
              this.serial.removeAllListeners();
            })
        }
      })
      .catch((e) => {
        console.error('[serial] Error listing serial ports:', e);
      });
  }

  openSerial() {
    return new Promise((resolve, reject) => {
      this.serial.open((e) => {
        if (e != null) {
          console.error(e);
          reject(e);
        } else {
          resolve();
        }
      })
    });
  }

  waitSolutionCompleted(callback) {
    this.solutionEnded = callback;
  }

  send(data: string) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Serial port not ready'));
      }
      this.serial.write(data, (e, bytesWritten) => {
        if (e) {
          reject(e);
        } else {
          console.log('[serial] Sending:', data);
          resolve(bytesWritten);
        }
      });
    });
  }
}