"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Converter = void 0;
const fs_1 = __importDefault(require("fs"));
const pascal_case_1 = require("pascal-case");
const path_1 = __importDefault(require("path"));
const destinationPaths_1 = require("../models/destinationPaths");
const pluginName_1 = require("../models/pluginName");
const schemaSource_1 = require("../models/schemaSource");
const commonHelpers_1 = require("./commonHelpers");
const fileHelpers_1 = require("./fileHelpers");
const interfaceBuilderFactory_1 = require("./interface-builders/interfaceBuilderFactory");
class Converter {
    constructor(config, strapiVersion, strapiDirectories) {
        this.strapiDirectories = strapiDirectories;
        this.config = config;
        this.commonHelpers = new commonHelpers_1.CommonHelpers(config, strapiDirectories.app.root);
        this.interfaceBuilder = interfaceBuilderFactory_1.InterfaceBuilderFactory.getInterfaceBuilder(strapiVersion, this.commonHelpers, config);
        this.commonHelpers.logger.verbose(`${pluginName_1.pluginName} configuration`, this.config);
        this.destinationPaths = new destinationPaths_1.DestinationPaths(config, strapiDirectories);
    }
    SchemasToTs() {
        const currentNodeEnv = process.env.NODE_ENV ?? '';
        const acceptedNodeEnvs = this.config.acceptedNodeEnvs ?? [];
        if (!acceptedNodeEnvs.includes(currentNodeEnv)) {
            this.commonHelpers.logger
                .information(`${pluginName_1.pluginName} plugin's acceptedNodeEnvs property does not include '${currentNodeEnv}' environment. Skipping conversion of schemas to Typescript.`);
            return;
        }
        const commonSchemas = this.interfaceBuilder.generateCommonSchemas(this.destinationPaths.commons, this.strapiDirectories.app.extensions);
        const apiSchemas = this.getSchemas(this.strapiDirectories.app.api, schemaSource_1.SchemaSource.Api);
        const componentSchemas = this.getSchemas(this.strapiDirectories.app.components, schemaSource_1.SchemaSource.Component, apiSchemas);
        const extensionSchemas = this.getSchemas(this.strapiDirectories.app.extensions, schemaSource_1.SchemaSource.Extension);
        this.adjustComponentsWhoseNamesWouldCollide(componentSchemas);
        const schemas = [...apiSchemas, ...componentSchemas, ...commonSchemas, ...extensionSchemas];
        for (const schema of schemas.filter(x => x.source !== schemaSource_1.SchemaSource.Common)) {
            this.interfaceBuilder.convertSchemaToInterfaces(schema, schemas);
        }
        const generatedInterfacesPaths = [];
        for (const schema of schemas) {
            const filePath = this.writeInterfacesFile(schema);
            generatedInterfacesPaths.push(filePath);
        }
        fileHelpers_1.FileHelpers.deleteUnnecessaryGeneratedInterfaces(this.strapiDirectories, this.commonHelpers.logger, generatedInterfacesPaths);
    }
    /**
    * A component could need the suffix and the by having it, it would end up with the same name as another one that didn't need it
      but whose name had the word 'Component' at the end
    */
    adjustComponentsWhoseNamesWouldCollide(componentSchemas) {
        for (const componentSchema of componentSchemas.filter(x => x.needsComponentSuffix)) {
            const component = componentSchemas.find(x => x.pascalName === componentSchema.pascalName && !x.needsComponentSuffix);
            if (component) {
                component.needsComponentSuffix = true;
                component.pascalName += 'Component';
            }
        }
    }
    getSchemas(folderPath, schemaSource, apiSchemas) {
        const files = [];
        if (fileHelpers_1.FileHelpers.folderExists(folderPath)) {
            const readFolder = (folderPath) => {
                const items = fs_1.default.readdirSync(folderPath);
                for (const item of items) {
                    const itemPath = path_1.default.join(folderPath, item);
                    const stat = fs_1.default.statSync(itemPath);
                    if (stat.isDirectory()) {
                        readFolder(itemPath);
                    }
                    else {
                        files.push(itemPath);
                    }
                }
            };
            readFolder(folderPath);
        }
        return files
            .filter((file) => ((schemaSource === schemaSource_1.SchemaSource.Api || schemaSource === schemaSource_1.SchemaSource.Extension) ? file.endsWith('schema.json') : file.endsWith('.json')))
            .map((file) => this.parseSchema(file, schemaSource, apiSchemas));
    }
    parseSchema(file, schemaSource, apiSchemas) {
        let schema = undefined;
        try {
            schema = JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
        }
        catch (e) {
            this.commonHelpers.logger.error(`Error while parsing the schema for ${file}:`, e);
        }
        let folder = '';
        let schemaName = '';
        switch (schemaSource) {
            case schemaSource_1.SchemaSource.Api:
                schemaName = schema?.info.singularName;
                folder = this.destinationPaths.useCustomDestinationFolder ? this.destinationPaths.apis : path_1.default.dirname(file);
                break;
            case schemaSource_1.SchemaSource.Common:
                schemaName = schema?.info.displayName;
                folder = this.destinationPaths.commons;
                break;
            case schemaSource_1.SchemaSource.Extension:
                if (schema?.info.displayName !== 'User') {
                    return;
                }
                folder = this.destinationPaths.commons;
                schemaName = schema?.info.displayName;
                break;
            case schemaSource_1.SchemaSource.Component:
                let fileNameWithoutExtension = path_1.default.basename(file, path_1.default.extname(file));
                schemaName = fileNameWithoutExtension;
                folder = path_1.default.dirname(file);
                const componentFolder = path_1.default.basename(folder);
                folder = this.destinationPaths.useCustomDestinationFolder
                    ? fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(this.destinationPaths.components, componentFolder)
                    : fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(folder, this.destinationPaths.componentInterfacesFolderName);
                break;
        }
        let pascalName = (0, pascal_case_1.pascalCase)(schemaName);
        let needsComponentSuffix = schemaSource === schemaSource_1.SchemaSource.Component &&
            (this.config.alwaysAddComponentSuffix || apiSchemas?.some(x => x.pascalName === pascalName));
        if (needsComponentSuffix) {
            pascalName += 'Component';
        }
        return {
            schemaPath: file,
            destinationFolder: folder,
            schema: schema,
            schemaName: schemaName,
            pascalName: pascalName,
            needsComponentSuffix: needsComponentSuffix,
            source: schemaSource,
            interfaceAsText: '',
            plainInterfaceAsText: '',
            noRelationsInterfaceAsText: '',
            adminPanelLifeCycleRelationsInterfaceAsText: '',
            dependencies: [],
            enums: [],
        };
    }
    writeInterfacesFile(schema) {
        const interfacesFileContent = this.interfaceBuilder.buildInterfacesFileContent(schema);
        const fileName = this.commonHelpers.getFileNameFromSchema(schema, true);
        return fileHelpers_1.FileHelpers.writeInterfaceFile(schema.destinationFolder, fileName, interfacesFileContent, this.commonHelpers.logger);
    }
}
exports.Converter = Converter;
