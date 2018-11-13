import * as Cube from 'cubejs';
require('cubejs/lib/solve.js');

export class CubeSolver {

  private cube;
  private cubeString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
  private webCubeString = 'wwwwwwwwwbbbbbbbbbrrrrrrrrryyyyyyyyygggggggggooooooooo';

  constructor() {
    Cube.initSolver();
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
    console.log(this.cube);
    
  }

  getString(): string {
    return this.webCubeString;
  }

  solve(): any {
    const solution = this.cube.solve().allReplace({
      'U2': 'U U',
      'F2': 'F F',
      'L2': 'L L',
      'D2': 'D D',
      'B2': 'B B',
      'R2': 'R R'
    });
    return {
      arduino: solution.allReplace({
        "U'": 'u',
        "F'": 'f',
        "L'": 'l',
        "D'": 'd',
        "B'": 'b',
        "R'": 'r'
      }).replace(' ', ''),
      // arduino: 'FUDBFBRLLRUDBFLLRLFB',
      web: solution.allReplace({
        'U': 'd',
        'D': 'u',
        'L': 'r',
        'R': 'l',
      })
    };
  }
}