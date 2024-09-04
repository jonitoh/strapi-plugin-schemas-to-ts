"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateInterfacesCommand = void 0;
const lodash_1 = __importDefault(require("lodash"));
const logLevel_1 = require("../../models/logLevel");
const pluginConfig_1 = require("../../models/pluginConfig");
const converter_1 = require("../converter");
const sharedCommandsConfiguration_1 = require("./sharedCommandsConfiguration");
class GenerateInterfacesCommand {
    static configureCommand(yargs) {
        return yargs
            .option('strapi-root-path', sharedCommandsConfiguration_1.SharedCommandsConfiguration.strapiRootPathConfiguration())
            .option('acceptedNodeEnvs', {
            alias: 'ne',
            describe: 'Accepted Node environments',
            type: 'array',
            default: pluginConfig_1.defaultPluginConfig.acceptedNodeEnvs,
        })
            .option('commonInterfacesFolderName', {
            alias: 'ci',
            describe: 'Name of the common interfaces folder',
            type: 'string',
            default: pluginConfig_1.defaultPluginConfig.commonInterfacesFolderName,
        })
            .option('alwaysAddEnumSuffix', {
            alias: 'es',
            describe: 'Always add enum suffix',
            type: 'boolean',
            default: pluginConfig_1.defaultPluginConfig.alwaysAddEnumSuffix,
        })
            .option('alwaysAddComponentSuffix', {
            alias: 'cs',
            describe: 'Always add component suffix',
            type: 'boolean',
            default: pluginConfig_1.defaultPluginConfig.alwaysAddComponentSuffix,
        })
            .option('usePrettierIfAvailable', {
            alias: 'p',
            describe: 'Use prettier if available',
            type: 'boolean',
            default: pluginConfig_1.defaultPluginConfig.usePrettierIfAvailable,
        })
            .option('logLevel', sharedCommandsConfiguration_1.SharedCommandsConfiguration.logLevelConfiguration())
            .option('destinationFolder', {
            alias: 'if',
            describe: 'Relative path (to the Strapi root one) of the folder where the interfaces need to be created. Empty for default.',
            type: 'string',
            default: pluginConfig_1.defaultPluginConfig.destinationFolder,
        });
    }
    static executeCommand(argv) {
        console.log(argv);
        if (argv.strapiRootPath) {
            const acceptedNodeEnvs = GenerateInterfacesCommand.curateAcceptedNodeEnvs(argv);
            const config = {
                acceptedNodeEnvs: acceptedNodeEnvs,
                alwaysAddComponentSuffix: argv.alwaysAddComponentSuffix,
                alwaysAddEnumSuffix: argv.alwaysAddEnumSuffix,
                commonInterfacesFolderName: argv.commonInterfacesFolderName,
                usePrettierIfAvailable: argv.usePrettierIfAvailable,
                logLevel: logLevel_1.LogLevel[argv.logLevel],
                destinationFolder: argv.destinationFolder,
            };
            const strapi = require("@strapi/strapi");
            const app = strapi({ distDir: "./dist" });
            const converter = new converter_1.Converter(config, app.config.info.strapi, app.dirs);
            converter.SchemasToTs();
        }
        else {
            console.error('strapi-root-path parameter was missing');
        }
    }
    static curateAcceptedNodeEnvs(argv) {
        if (!Array.isArray(argv.acceptedNodeEnvs)) {
            argv.acceptedNodeEnvs = new Array();
        }
        argv.acceptedNodeEnvs = argv.acceptedNodeEnvs
            .flatMap((item) => item.split(','));
        // If the execution doesn't have an environment, the empty one must be accepted
        argv.acceptedNodeEnvs.push('');
        // Only different values will be accepted
        argv.acceptedNodeEnvs = lodash_1.default.uniq(argv.acceptedNodeEnvs);
        return argv.acceptedNodeEnvs;
    }
}
exports.GenerateInterfacesCommand = GenerateInterfacesCommand;
