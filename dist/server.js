"use strict";
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
        this.cubeSolver = new cubesolver_1.CubeSolver();
        this.app = express();
        this.server = http_1.createServer(this.app);
        this.io = socketIo(this.server);
        this.listen();
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
        this.io.on('connect', (socket) => {
            console.log('Connected client on port %s.', this.port);
            // setInterval(() => {
            //   this.io.emit('message', new Message('move', 'B'));
            // }, 2000);
            socket.on('message', (m) => {
                console.log('[server](message): %s', JSON.stringify(m));
                if (m.action === 'setString') {
                    this.cubeSolver.buildCube(m.content);
                }
                else if (m.action === 'getString') {
                    this.io.emit('message', new message_1.Message('setString', this.cubeSolver.getString()));
                }
                else if (m.action === 'solve') {
                    const solution = this.cubeSolver.solve();
                    this.io.emit('message', new message_1.Message('move', solution.web));
                    this.serial.send(solution.arduino);
                }
            });
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.RubikSolverServer = RubikSolverServer;
