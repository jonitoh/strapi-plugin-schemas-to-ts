#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const deleteAllGeneratedFilesCommand_1 = require("./cli-commands/deleteAllGeneratedFilesCommand");
const generateInterfacesCommand_1 = require("./cli-commands/generateInterfacesCommand");
const commonHelpers_1 = require("./commonHelpers");
(0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .command('deleteAllGeneratedFiles [strapi-root-path]', `Deletes all files that has a first line with the text '${commonHelpers_1.CommonHelpers.headerComment.trimEnd()}'`, (yargs) => deleteAllGeneratedFilesCommand_1.DeleteAllGeneratedFilesCommand.configureCommand(yargs), (argv) => deleteAllGeneratedFilesCommand_1.DeleteAllGeneratedFilesCommand.executeCommand(argv)).command('generateInterfaces [strapi-root-path]', 'Description of the second command', (yargs) => generateInterfacesCommand_1.GenerateInterfacesCommand.configureCommand(yargs), (argv) => generateInterfacesCommand_1.GenerateInterfacesCommand.executeCommand(argv))
    .demandCommand(1)
    .help()
    .argv;
