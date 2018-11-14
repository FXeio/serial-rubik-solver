import * as Cube from 'cubejs';
import { Solution } from './model/solution';
require('cubejs/lib/solve.js');

export class CubeSolver {

  private cube;
  private cubeString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
  private webCubeString = 'wwwwwwwwwbbbbbbbbbrrrrrrrrryyyyyyyyygggggggggooooooooo';
  currentSolution: Solution;

  private startTime: number;

  constructor() {
  }

  init() {
    return new Promise(async (resolve, reject) => {
      await Cube.initSolver();
      console.log('[cubesolver] Cube initialized');
      resolve();
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
    this.cube = Cube.fromString(this.cubeString);

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

  solve(maxMoves): Promise<Solution> {
    return new Promise(async (resolve, reject) => {
      const solvingFor = this.cubeString;
      const rawSolution = this.cube.solve(maxMoves).allReplace({
        'U2': 'U U',
        'F2': 'F F',
        'L2': 'L L',
        'D2': 'D D',
        'B2': 'B B',
        'R2': 'R R'
      });
      if (this.cubeString === solvingFor) {
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
          }).replace(/ /g, '')
        );
        this.currentSolution = solution;
        resolve(solution);
      } else {
        reject(new Error('Solution timed out'));
      }
    });
  }
}