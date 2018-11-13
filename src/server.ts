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

  constructor() {
    this.serial = new Serial();
    this.cubeSolver = new CubeSolver();
    this.app = express();
    this.server = createServer(this.app);
    this.io = socketIo(this.server);
    this.listen();
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on('connect', (socket: any) => {
      console.log('Connected client on port %s.', this.port);
      // setInterval(() => {
      //   this.io.emit('message', new Message('move', 'B'));
      // }, 2000);
      socket.on('message', (m: Message) => {
        console.log('[server](message): %s', JSON.stringify(m));
        if (m.action === 'setString') {
          this.cubeSolver.buildCube(m.content);
        } else if (m.action === 'getString') {
          this.io.emit('message', new Message('setString', this.cubeSolver.getString()));
        } else if (m.action === 'solve') {
          const solution = this.cubeSolver.solve();
          this.io.emit('message', new Message('move', solution.web));
          this.serial.send(solution.arduino);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
