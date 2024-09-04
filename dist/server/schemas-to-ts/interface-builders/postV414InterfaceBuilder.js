"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostV414InterfaceBuilder = void 0;
const interfaceBuilder_1 = require("./interfaceBuilder");
class PostV414InterfaceBuilder extends interfaceBuilder_1.InterfaceBuilder {
    constructor(commonHelpers, config) {
        super(commonHelpers, config);
    }
    addVersionSpecificCommonSchemas(commonSchemas, commonFolderModelsPath) {
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'BeforeRunEvent', `import { Event } from '@strapi/database/dist/lifecycles';
  
    export interface BeforeRunEvent<TState extends Record<string, unknown>> extends Event {
      state: TState;
    }`);
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'AfterRunEvent', `import { BeforeRunEvent } from './BeforeRunEvent';
  
    export interface AfterRunEvent<TState, TResult> extends BeforeRunEvent<TState extends Record<string, unknown> ? TState : never> {
      result: TResult;
    }
    `);
        return commonSchemas;
    }
}
exports.PostV414InterfaceBuilder = PostV414InterfaceBuilder;
