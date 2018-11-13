// @ts-ignore
String.prototype.allReplace = function (obj) {
    var retStr = this;
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
    }
    return retStr;
};

import { RubikSolverServer } from './server';

let app = new RubikSolverServer().getApp();
export { app };
