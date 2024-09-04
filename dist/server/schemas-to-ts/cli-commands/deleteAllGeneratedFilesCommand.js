"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAllGeneratedFilesCommand = void 0;
const logLevel_1 = require("../../models/logLevel");
const fileHelpers_1 = require("../fileHelpers");
const logger_1 = require("../logger");
const sharedCommandsConfiguration_1 = require("./sharedCommandsConfiguration");
class DeleteAllGeneratedFilesCommand {
    static configureCommand(yargs) {
        return yargs
            .option('strapi-root-path', sharedCommandsConfiguration_1.SharedCommandsConfiguration.strapiRootPathConfiguration())
            .option('logLevel', sharedCommandsConfiguration_1.SharedCommandsConfiguration.logLevelConfiguration());
    }
    static executeCommand(argv) {
        if (argv.strapiRootPath) {
            console.log(`Executing script at path: ${argv.strapiRootPath}`);
            const strapiDirectories = fileHelpers_1.FileHelpers.buildStrapiDirectoriesFromRootPath(argv.strapiRootPath);
            const logger = new logger_1.Logger(logLevel_1.LogLevel[argv.logLevel]);
            fileHelpers_1.FileHelpers.deleteUnnecessaryGeneratedInterfaces(strapiDirectories, logger);
        }
        else {
            console.error('strapi-root-path parameter was missing');
        }
    }
}
exports.DeleteAllGeneratedFilesCommand = DeleteAllGeneratedFilesCommand;
