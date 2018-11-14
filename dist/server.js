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
const http_1 = require("http");
const express = require("express");
const socketIo = require("socket.io");
const message_1 = require("./model/message");
const cubesolver_1 = require("./cubesolver");
const serial_1 = require("./serial");
class RubikSolverServer {
    constructor() {
        this.port = 8080;
        this.serial = new serial_1.Serial();
        this.app = express();
        this.server = http_1.createServer(this.app);
        this.io = socketIo(this.server);
        this.cubeSolver = new cubesolver_1.CubeSolver();
        this.cubeSolver.init()
            .then(() => {
            this.listen();
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('[WS] Running server on port', this.port);
        });
        this.io.on('connect', (socket) => {
            console.log('[WS] New client');
            // setInterval(() => {
            //   this.io.emit('message', new Message('move', 'B'));
            // }, 2000);
            socket.on('message', (m) => __awaiter(this, void 0, void 0, function* () {
                console.log('[WS](new message):', m);
                if (m.action === 'setString') {
                    this.cubeSolver.buildCube(m.content);
                }
                else if (m.action === 'getString') {
                    this.io.emit('message', new message_1.Message('setString', this.cubeSolver.getString()));
                }
                else if (m.action === 'searchSolutions') {
                    for (let i = 22; i > 0; i--) {
                        yield this.cubeSolver.solve(i)
                            .then((solution) => {
                            this.io.emit('message', new message_1.Message('solution', solution.web));
                            i = solution.count - 1;
                        })
                            .catch((e) => {
                            console.error('[cubesolver]', e);
                        });
                    }
                }
                else if (m.action === 'solve') {
                    if (this.cubeSolver.currentSolution == null) {
                        console.error('[cubesolver] No solution found yet');
                        return;
                    }
                    this.serial.send(this.cubeSolver.currentSolution.arduino)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        this.cubeSolver.startStopWatch();
                        this.serial.waitSolutionCompleted(() => {
                            this.io.emit('message', new message_1.Message('totalTime', this.cubeSolver.endStopWatch().toString()));
                        });
                    }))
                        .catch((e) => {
                        console.error('[serial]', e);
                    });
                    this.io.emit('message', new message_1.Message('move', this.cubeSolver.currentSolution.web));
                }
            }));
            socket.on('disconnect', () => {
                console.log('[WS] Client disconnected');
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.RubikSolverServer = RubikSolverServer;
