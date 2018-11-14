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
const Cube = require("cubejs");
const solution_1 = require("./model/solution");
require('cubejs/lib/solve.js');
class CubeSolver {
    constructor() {
        this.cubeString = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
        this.webCubeString = 'wwwwwwwwwbbbbbbbbbrrrrrrrrryyyyyyyyygggggggggooooooooo';
    }
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield Cube.initSolver();
            console.log('[cubesolver] Cube initialized');
            resolve();
        }));
    }
    buildCube(fromString) {
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
    getString() {
        return this.webCubeString;
    }
    startStopWatch() {
        this.startTime = Date.now();
    }
    endStopWatch() {
        return Date.now() - this.startTime;
    }
    solve(maxMoves) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
                let solution = new solution_1.Solution(rawSolution.allReplace({
                    'U': 'd',
                    'D': 'u',
                    'L': 'r',
                    'R': 'l',
                }), rawSolution.allReplace({
                    "U'": 'u',
                    "F'": 'f',
                    "L'": 'l',
                    "D'": 'd',
                    "B'": 'b',
                    "R'": 'r'
                }).replace(/ /g, ''));
                this.currentSolution = solution;
                resolve(solution);
            }
            else {
                reject(new Error('Solution timed out'));
            }
        }));
    }
}
exports.CubeSolver = CubeSolver;
