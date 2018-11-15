import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import { Message } from './model/message';

import { CubeSolver } from './cubesolver';

import { Serial } from './serial';

export class RubikSolverServer {

  private port = 8080;
  private cubeSolver: CubeSolver;
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private serial: Serial;

  private solving = false;

  constructor() {
    this.serial = new Serial();
    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIo(this.server);
    this.cubeSolver = new CubeSolver();
    this.listen();
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('[WS] Running server on port', this.port);
    });

    this.io.on('connect', (socket: any) => {
      console.log('[WS] New client');
      // setInterval(() => {
      //   this.io.emit('message', new Message('move', 'B'));
      // }, 2000);
      socket.on('message', async (m: Message) => {
        console.log('[WS](new message):', m);
        if (m.action === 'setString') {
          this.cubeSolver.buildCube(m.content);
        } else if (m.action === 'getString') {
          this.io.emit('message', new Message('setString', this.cubeSolver.getString()));
        } else if (m.action === 'searchSolutions') {
          this.solving = true;
          for (let i = 22; i > 0; i--) {
            let toExit = false;
            await this.cubeSolver.solve(i)
              .then((solution) => {
                this.io.emit('message', new Message('solution', solution.web));
                if (solution.count > i) {
                  toExit = true;
                }
                i = solution.count - 1;
              })
              .catch((e) => {
                console.error('[cubesolver]', e);
              });
            if (toExit) {
              break;
            }
          }
          console.log('[cubesolver] That was the best one');
          
        } else if (m.action === 'solve') {
          if (this.cubeSolver.currentSolution == null) {
            console.error('[cubesolver] No solutions found yet');
            return;
          }
          this.solving = false;
          this.cubeSolver.stopSolving();
          this.serial.send(this.cubeSolver.currentSolution.arduino)
            .then(async () => {
              this.cubeSolver.startStopWatch();
              this.serial.waitSolutionCompleted(() => {
                this.io.emit('message', new Message('totalTime', this.cubeSolver.endStopWatch().toString()));
              });
            })
            .catch((e) => {
              console.error('[serial]', e);
            });
          this.io.emit('message', new Message('move', this.cubeSolver.currentSolution.web));
        }
      });

      socket.on('disconnect', () => {
        console.log('[WS] Client disconnected');
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
