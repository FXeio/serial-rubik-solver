"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
String.prototype.allReplace = function (obj) {
    var retStr = this;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};
const server_1 = require("./server");
let app = new server_1.RubikSolverServer().getApp();
exports.app = app;
