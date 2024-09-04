"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPluginConfig = void 0;
const logLevel_1 = require("./logLevel");
const pluginName_1 = require("./pluginName");
exports.defaultPluginConfig = {
    acceptedNodeEnvs: ["development"],
    commonInterfacesFolderName: pluginName_1.pluginName,
    alwaysAddEnumSuffix: false,
    alwaysAddComponentSuffix: false,
    usePrettierIfAvailable: true,
    logLevel: logLevel_1.LogLevel.Debug,
    destinationFolder: undefined,
};
