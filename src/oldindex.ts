import fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// import SerialPort = require('serialport');
import * as SerialPort from 'serialport';
import * as Cube from 'cubejs';
require('cubejs/lib/solve.js');

let serial = new SerialPort(config.serial.port, {
  baudRate: config.serial.baudRate
});

// This takes 4-5 seconds on a modern computer
Cube.initSolver();

const cube = Cube.fromString('FBURUUDULDFFBRLUUDLLBDFDBBBRRLRDRRLRLFFFLLDDURUUBBDFFB');
// U: White
// R: Blue
// F: Red
// D: Yellow
// L: Green
// B: Orange

let solution = cube.solve().split(' ');
console.log(solution);

let index = 0;

function nextStep() {
  if (solution[index] != null) {
    serial.write(solution[index++]);
  } else {
    serial.write('e'); // end
  }
}


serial.on('open', () => {
  console.log('Port opened!');
  // Arduino needs to restart after serial open
  setTimeout(() => {
    nextStep();
  }, 2000);
});


serial.on('data', (data) => {
  if (data == 'k') {
    nextStep();
  }
});
