"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const logLevel_1 = require("../models/logLevel");
class Logger {
    constructor(minimumLevel) {
        this.minimumLevel = minimumLevel;
    }
    verbose(...args) {
        if (this.minimumLevel <= logLevel_1.LogLevel.Verbose) {
            console.log(chalk_1.default.gray('VERBOSE:'), ...args);
        }
    }
    debug(...args) {
        if (this.minimumLevel <= logLevel_1.LogLevel.Debug) {
            console.log(chalk_1.default.blue('DEBUG:'), ...args);
        }
    }
    information(...args) {
        if (this.minimumLevel <= logLevel_1.LogLevel.Information) {
            console.log(chalk_1.default.green('INFO:'), ...args);
        }
    }
    error(...args) {
        if (this.minimumLevel <= logLevel_1.LogLevel.Error) {
            console.log(chalk_1.default.red('ERROR:'), ...args);
        }
    }
}
exports.Logger = Logger;
