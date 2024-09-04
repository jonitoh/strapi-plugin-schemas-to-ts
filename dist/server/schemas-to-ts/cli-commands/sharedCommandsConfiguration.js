"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedCommandsConfiguration = void 0;
const logLevel_1 = require("../../models/logLevel");
const pluginConfig_1 = require("../../models/pluginConfig");
class SharedCommandsConfiguration {
    static strapiRootPathConfiguration() {
        return {
            describe: 'Path to the Strapi project root',
            type: 'string',
            demandOption: true,
        };
    }
    static logLevelConfiguration() {
        return {
            alias: 'l',
            describe: 'Set the log level',
            type: 'string',
            choices: [
                logLevel_1.LogLevel[logLevel_1.LogLevel.None],
                logLevel_1.LogLevel[logLevel_1.LogLevel.Verbose],
                logLevel_1.LogLevel[logLevel_1.LogLevel.Debug],
                logLevel_1.LogLevel[logLevel_1.LogLevel.Information],
                logLevel_1.LogLevel[logLevel_1.LogLevel.Error]
            ],
            default: logLevel_1.LogLevel[pluginConfig_1.defaultPluginConfig.logLevel],
        };
    }
}
exports.SharedCommandsConfiguration = SharedCommandsConfiguration;
