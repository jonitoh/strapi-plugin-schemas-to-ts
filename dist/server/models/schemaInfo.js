"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaSource_1 = require("./schemaSource");
const defaultSchemaInfo = {
    schemaPath: '',
    destinationFolder: '',
    schema: undefined,
    schemaName: '',
    pascalName: '',
    needsComponentSuffix: false,
    source: schemaSource_1.SchemaSource.Common,
    interfaceAsText: '',
    plainInterfaceAsText: '',
    noRelationsInterfaceAsText: '',
    adminPanelLifeCycleRelationsInterfaceAsText: '',
    dependencies: [],
    enums: [],
};
exports.default = defaultSchemaInfo;
