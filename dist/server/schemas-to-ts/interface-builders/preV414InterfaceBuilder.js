"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreV414InterfaceBuilder = void 0;
const interfaceBuilder_1 = require("./interfaceBuilder");
class PreV414InterfaceBuilder extends interfaceBuilder_1.InterfaceBuilder {
    constructor(commonHelpers, config) {
        super(commonHelpers, config);
    }
    addVersionSpecificCommonSchemas(commonSchemas, commonFolderModelsPath) {
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'BeforeRunEvent', `import { Event } from '@strapi/database/lib/lifecycles/index';
  
    export interface BeforeRunEvent<TState> extends Event {
      state: TState;
    }`);
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'AfterRunEvent', `import { BeforeRunEvent } from './BeforeRunEvent';
  
    export interface AfterRunEvent<TState, TResult> extends BeforeRunEvent<TState> {
      result: TResult;
    }
    `);
        return commonSchemas;
    }
}
exports.PreV414InterfaceBuilder = PreV414InterfaceBuilder;
