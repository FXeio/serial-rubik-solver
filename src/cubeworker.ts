const Cube = require('cubejs');
require('cubejs/lib/solve.js');

Cube.initSolver();

let cube;

module.exports = function (input, done) {
  if (input.cubeString != null) {
    cube = Cube.fromString(input.cubeString);
  } else {
    let solution;
    let e;
    try {
      solution = cube.solve(input.maxMoves)
    } catch (error) {
      e = error;
    }
    done({solution: solution, error: e});
  }
};

console.log('[cubeworker] Cube thread ready');