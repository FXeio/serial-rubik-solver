import * as Cube from 'cubejs';
import { Solution } from './model/solution';
require('cubejs/lib/solve.js');

import { spawn } from 'threads'

export class CubeSolver {

  private cubeString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
  private webCubeString = 'wwwwwwwwwbbbbbbbbbrrrrrrrrryyyyyyyyygggggggggooooooooo';
  currentSolution: Solution;
  private cubeThread;
  private solvingPromiseResolve;
  private solvingPromiseReject;

  private startTime: number;

  constructor() {
    this.resetWorker();
  }

  resetWorker() {
    if (this.cubeThread != null) {
      this.cubeThread.kill();
    }
    this.cubeThread = spawn('./dist/cubeworker');
    this.cubeThread.on('message', (message) => {
      if (message.error != null) {
        console.error(message.error);
        return;
      }
      let rawSolution = message.solution;
      const count = rawSolution.split(' ').length;
      rawSolution = rawSolution.allReplace({
        'U2': 'U U',
        'F2': 'F F',
        'L2': 'L L',
        'D2': 'D D',
        'B2': 'B B',
        'R2': 'R R'
      });
      console.log('[cubesolver] New solution:', rawSolution);
      let solution = new Solution(
        rawSolution.allReplace({
          'U': 'd',
          'D': 'u',
          'L': 'r',
          'R': 'l',
        }),
        rawSolution.allReplace({
          "U'": 'u',
          "F'": 'f',
          "L'": 'l',
          "D'": 'd',
          "B'": 'b',
          "R'": 'r'
        }).replace(/ /g, ''),
        count
      );
      this.currentSolution = solution;
      this.solvingPromiseResolve(solution);
    });
  }

  buildCube(fromString: string) {
    // @ts-ignore
    let tmpString = fromString.allReplace({
      'w': 'U',
      'b': 'F',
      'r': 'L',
      'y': 'D',
      'g': 'B',
      'o': 'R'
    });
    this.webCubeString = fromString;
    this.cubeString = tmpString.substr(0, 9) + tmpString.substr(45, 9) + tmpString.substr(9, 9) + tmpString.substr(27, 9) + tmpString.substr(18, 9) + tmpString.substr(36, 9);
    this.cubeThread.send({ cubeString: this.cubeString });
  }

  getString(): string {
    return this.webCubeString;
  }

  startStopWatch() {
    this.startTime = Date.now();
  }

  endStopWatch(): number {
    return Date.now() - this.startTime;
  }

  stopSolving() {
    this.solvingPromiseReject('Thread killed');
    this.resetWorker();
  }

  solve(maxMoves): Promise<Solution> {
    return new Promise((resolve, reject) => {
      this.solvingPromiseReject = reject;
      this.solvingPromiseResolve = resolve;
      this.cubeThread.send({
        maxMoves: maxMoves
      });
    });
  }
}