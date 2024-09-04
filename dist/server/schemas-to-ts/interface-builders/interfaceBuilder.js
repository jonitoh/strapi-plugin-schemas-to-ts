"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceBuilder = void 0;
const pascal_case_1 = require("pascal-case");
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const schemaInfo_1 = __importDefault(require("../../models/schemaInfo"));
const schemaSource_1 = require("../../models/schemaSource");
const schemaType_1 = require("../../models/schemaType");
const commonHelpers_1 = require("../commonHelpers");
const fileHelpers_1 = require("../fileHelpers");
const plainClassSuffix = '_Plain';
const noRelationsClassSuffix = '_NoRelations';
const adminPanelLifeCycleClassSuffix = '_AdminPanelLifeCycle';
class InterfaceBuilder {
    constructor(commonHelpers, config) {
        this.commonHelpers = commonHelpers;
        this.config = config;
        this.prettierOptions = this.commonHelpers.getPrettierOptions();
    }
    convertSchemaToInterfaces(schema, schemas) {
        this.commonHelpers.logger.debug('Converting schema', schema.schemaPath);
        if (schema.source === schemaSource_1.SchemaSource.Extension && schema.schema.attributes.role) {
            delete schema.schema.attributes.role;
        }
        this.convertToInterface(schema, schemas, schemaType_1.SchemaType.Standard);
        this.convertToInterface(schema, schemas, schemaType_1.SchemaType.Plain);
        this.convertToInterface(schema, schemas, schemaType_1.SchemaType.NoRelations);
        if (schema.source === schemaSource_1.SchemaSource.Api) {
            this.convertToInterface(schema, schemas, schemaType_1.SchemaType.AdminPanelLifeCycle);
        }
        schema.dependencies = [...new Set(schema.dependencies)];
        schema.enums = [...new Set(schema.enums)];
    }
    buildInterfacesFileContent(schema) {
        let interfacesFileContent = this.commonHelpers.headerComment;
        if (schema.dependencies?.length > 0) {
            interfacesFileContent += schema.dependencies.join('\n');
            interfacesFileContent += '\n\n';
        }
        if (schema.enums?.length > 0) {
            interfacesFileContent += schema.enums.join('\n');
            interfacesFileContent += '\n\n';
        }
        let interfacesText = schema.interfaceAsText;
        interfacesText += `\n${schema.plainInterfaceAsText}`;
        interfacesText += `\n${schema.noRelationsInterfaceAsText}`;
        interfacesText += `\n${schema.adminPanelLifeCycleRelationsInterfaceAsText}`;
        interfacesText = interfacesText.replace('\n\n', '\n');
        interfacesFileContent += interfacesText;
        if (this.prettierOptions) {
            interfacesFileContent = prettier_1.default.format(interfacesFileContent, this.prettierOptions);
        }
        return interfacesFileContent;
    }
    generateCommonSchemas(commonFolderModelsPath, sourceExtensionFolderModelsPath) {
        const commonSchemas = [];
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'Payload', `export interface Payload<T> {
      data: T;
      meta: {
        pagination?: {
          page: number;
          pageSize: number;
          pageCount: number;
          total: number;
        }
      };
    }
    `);
        if (!sourceExtensionFolderModelsPath
            || !fileHelpers_1.FileHelpers.folderExists(`${sourceExtensionFolderModelsPath}/users-permissions/content-types/user`)) {
            this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'User', `export interface User {
        id: number;
        attributes: {
          username: string;
          email: string;
          provider: string;
          confirmed: boolean;
          blocked: boolean;
          createdAt: Date;
          updatedAt: Date;
        }
      }
      `, `export interface User_Plain {
        id: number;
        username: string;
        email: string;
        provider: string;
        confirmed: boolean;
        blocked: boolean;
        createdAt: Date;
        updatedAt: Date;
      }
    `);
        }
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'MediaFormat', `export interface MediaFormat {
      name: string;
      hash: string;
      ext: string;
      mime: string;
      width: number;
      height: number;
      size: number;
      path: string;
      url: string;
    }
    `);
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'Media', `import { MediaFormat } from './MediaFormat';
    export interface Media {
      id: number;
      attributes: {
        name: string;
        alternativeText: string;
        caption: string;
        width: number;
        height: number;
        formats: { thumbnail: MediaFormat; small: MediaFormat; medium: MediaFormat; large: MediaFormat; };
        hash: string;
        ext: string;
        mime: string;
        size: number;
        url: string;
        previewUrl: string;
        provider: string;
        createdAt: Date;
        updatedAt: Date;
      }
    }

    export interface Media_Plain {
      id: number;
      name: string;
      alternativeText: string;
      caption: string;
      width: number;
      height: number;
      formats: { thumbnail: MediaFormat; small: MediaFormat; medium: MediaFormat; large: MediaFormat; };
      hash: string;
      ext: string;
      mime: string;
      size: number;
      url: string;
      previewUrl: string;
      provider: string;
      createdAt: Date;
      updatedAt: Date;
    }
    `);
        this.addCommonSchema(commonSchemas, commonFolderModelsPath, 'AdminPanelRelationPropertyModification', `export interface AdminPanelRelationPropertyModification<T> {
      connect: T[];
      disconnect: T[];
    }
    `);
        this.addVersionSpecificCommonSchemas(commonSchemas, commonFolderModelsPath);
        return commonSchemas;
    }
    addCommonSchema(schemas, commonFolderModelsPath, pascalName, interfaceAsText, plainInterfaceAsText) {
        const schemaInfo = Object.assign({}, schemaInfo_1.default);
        schemaInfo.destinationFolder = commonFolderModelsPath;
        schemaInfo.pascalName = pascalName;
        schemaInfo.interfaceAsText = interfaceAsText;
        if (plainInterfaceAsText) {
            schemaInfo.plainInterfaceAsText = plainInterfaceAsText;
        }
        schemas.push(schemaInfo);
    }
    convertToInterface(schemaInfo, allSchemas, schemaType) {
        if (!schemaInfo.schema) {
            this.commonHelpers.logger.information(`Skipping ${schemaInfo.schemaPath}: schema is empty.`);
            return null;
        }
        const builtInterface = this.buildInterfaceText(schemaInfo, schemaType, allSchemas);
        for (const dependency of builtInterface.interfaceDependencies) {
            const dependencySchemaInfo = allSchemas.find((x) => {
                return x.pascalName === dependency.replace(plainClassSuffix, '').replace(noRelationsClassSuffix, '');
            });
            let importPath = schemaInfo.destinationFolder;
            if (dependencySchemaInfo) {
                importPath = fileHelpers_1.FileHelpers.getRelativePath(importPath, dependencySchemaInfo.destinationFolder);
                const fileName = this.commonHelpers.getFileNameFromSchema(dependencySchemaInfo, false);
                importPath = this.getImportPath(importPath, fileName);
            }
            // When a schema name is not single-worded in Strapi, it will have a hyphen between each pair of words,
            // so the import path would be different from the pascal name.
            // This is why it is needed to also compare with the schema name.
            if (dependency !== schemaInfo.pascalName &&
                importPath.toLowerCase() !== `./${schemaInfo.pascalName.toLowerCase()}` &&
                importPath.toLowerCase() !== `./${schemaInfo.schemaName.toLowerCase()}`) {
                const dependencyImport = `import { ${dependency} } from '${importPath}';`;
                this.commonHelpers.logger.verbose(`Adding dependency to ${schemaInfo.pascalName}`, dependencyImport);
                schemaInfo.dependencies.push(dependencyImport);
            }
        }
        schemaInfo.enums.push(...builtInterface.interfaceEnums);
        if (schemaType === schemaType_1.SchemaType.Standard) {
            schemaInfo.interfaceAsText = builtInterface.interfaceText;
        }
        else if (schemaType === schemaType_1.SchemaType.Plain) {
            schemaInfo.plainInterfaceAsText = builtInterface.interfaceText;
        }
        else if (schemaType === schemaType_1.SchemaType.NoRelations) {
            schemaInfo.noRelationsInterfaceAsText = builtInterface.interfaceText;
        }
        else if (schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
            schemaInfo.adminPanelLifeCycleRelationsInterfaceAsText = builtInterface.interfaceText;
        }
    }
    isOptional(attributeValue) {
        // arrays are never null
        if (attributeValue.relation === 'oneToMany' || attributeValue.repeatable) {
            return false;
        }
        return attributeValue.required !== true;
    }
    buildInterfaceText(schemaInfo, schemaType, allSchemas) {
        const interfaceName = this.getInterfaceName(schemaInfo, schemaType);
        const interfaceEnums = [];
        const interfaceDependencies = [];
        let interfaceText = `export interface ${interfaceName} {\n`;
        if (schemaInfo.source === schemaSource_1.SchemaSource.Api || schemaInfo.source === schemaSource_1.SchemaSource.Extension) {
            interfaceText += `  id: number;\n`;
        }
        let indentation = '  ';
        if ((schemaInfo.source === schemaSource_1.SchemaSource.Api || schemaInfo.source === schemaSource_1.SchemaSource.Extension) && schemaType === schemaType_1.SchemaType.Standard) {
            interfaceText += `  attributes: {\n`;
            indentation += '  ';
        }
        if (schemaInfo.source !== schemaSource_1.SchemaSource.Component) {
            interfaceText += `${indentation}createdAt: Date;`;
            interfaceText += `${indentation}updatedAt: Date;`;
            interfaceText += `${indentation}publishedAt?: Date;`;
        }
        const attributes = Object.entries(schemaInfo.schema.attributes);
        for (const attribute of attributes) {
            const originalPropertyName = attribute[0];
            let propertyName = originalPropertyName;
            const attributeValue = attribute[1];
            if (this.isOptional(attributeValue)) {
                propertyName += '?';
            }
            let propertyType;
            let propertyDefinition;
            // -------------------------------------------------
            // Relation
            // -------------------------------------------------
            if (attributeValue.type === 'relation') {
                propertyType = attributeValue.target === 'plugin::users-permissions.user'
                    ? 'User'
                    : `${(0, pascal_case_1.pascalCase)(attributeValue.target.split('.')[1])}`;
                if (schemaType === schemaType_1.SchemaType.Plain || schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
                    propertyType += plainClassSuffix;
                }
                interfaceDependencies.push(propertyType);
                const isArray = attributeValue.relation.endsWith('ToMany');
                const bracketsIfArray = isArray ? '[]' : '';
                if (schemaType === schemaType_1.SchemaType.Standard) {
                    propertyDefinition = `${indentation}${propertyName}: { data: ${propertyType}${bracketsIfArray} };\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.Plain) {
                    propertyDefinition = `${indentation}${propertyName}: ${propertyType}${bracketsIfArray};\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.NoRelations) {
                    propertyDefinition = `${indentation}${propertyName}: number${bracketsIfArray};\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
                    // AdminPanelRelationPropertyModification would never be an array, for it contains the arrays.
                    propertyDefinition = `${indentation}${propertyName}: AdminPanelRelationPropertyModification<${propertyType}>;\n`;
                    interfaceDependencies.push('AdminPanelRelationPropertyModification');
                }
            }
            // -------------------------------------------------
            // Component
            // -------------------------------------------------
            else if (attributeValue.type === 'component') {
                propertyType =
                    attributeValue.target === 'plugin::users-permissions.user'
                        ? 'User'
                        : (0, pascal_case_1.pascalCase)(attributeValue.component.split('.')[1]);
                const componentInfo = this.getAttributeComponentInfo(propertyType, allSchemas);
                if (componentInfo.needsComponentSuffix) {
                    propertyType += 'Component';
                }
                if (schemaType === schemaType_1.SchemaType.Plain || schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
                    propertyType += plainClassSuffix;
                }
                if (schemaType === schemaType_1.SchemaType.NoRelations) {
                    propertyType += noRelationsClassSuffix;
                }
                interfaceDependencies.push(propertyType);
                const isArray = attributeValue.repeatable;
                const bracketsIfArray = isArray ? '[]' : '';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType}${bracketsIfArray};\n`;
            }
            // -------------------------------------------------
            // Dynamic zone
            // -------------------------------------------------
            else if (attributeValue.type === 'dynamiczone') {
                // TODO
                propertyType = 'any';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Media
            // -------------------------------------------------
            else if (attributeValue.type === 'media') {
                propertyType = 'Media';
                if (schemaType === schemaType_1.SchemaType.Plain || schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
                    propertyType += plainClassSuffix;
                }
                interfaceDependencies.push(propertyType);
                const bracketsIfArray = attributeValue.multiple ? '[]' : '';
                if (schemaType === schemaType_1.SchemaType.Standard) {
                    propertyDefinition = `${indentation}${propertyName}: { data: ${propertyType}${bracketsIfArray} };\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.Plain) {
                    propertyDefinition = `${indentation}${propertyName}: ${propertyType}${bracketsIfArray};\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.NoRelations) {
                    propertyDefinition = `${indentation}${propertyName}: number${bracketsIfArray};\n`;
                }
                else if (schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
                    propertyDefinition = `${indentation}${propertyName}: AdminPanelRelationPropertyModification<${propertyType}>${bracketsIfArray};\n`;
                    interfaceDependencies.push('AdminPanelRelationPropertyModification');
                }
            }
            // -------------------------------------------------
            // Enumeration
            // -------------------------------------------------
            else if (attributeValue.type === 'enumeration') {
                let enumName = commonHelpers_1.CommonHelpers.capitalizeFirstLetter((0, pascal_case_1.pascalCase)(originalPropertyName));
                if (this.config.alwaysAddEnumSuffix ||
                    originalPropertyName.toLowerCase() === schemaInfo.pascalName.toLowerCase() ||
                    originalPropertyName.toLowerCase() === `${schemaInfo.pascalName.toLowerCase()}${plainClassSuffix.toLowerCase()}` ||
                    originalPropertyName.toLowerCase() === `${schemaInfo.pascalName.toLowerCase()}${noRelationsClassSuffix.toLowerCase()}` ||
                    originalPropertyName.toLowerCase() === `${schemaInfo.pascalName.toLowerCase()}${adminPanelLifeCycleClassSuffix.toLowerCase()}`) {
                    enumName += 'Enum';
                }
                const enumOptions = attributeValue.enum.map((value) => {
                    let key = value;
                    // The normalize('NFD') method will decompose the accented characters into their basic letters and combining diacritical marks.
                    key = key.normalize("NFD");
                    // Following Typescript documentation, enum keys are Pascal Case.: https://www.typescriptlang.org/docs/handbook/enums.html
                    key = (0, pascal_case_1.pascalCase)(key);
                    /*
                    The /[^a-z0-9]/gi is a regular expression that matches any character that is not a letter (a-z, case insensitive due to i) or a digit (0-9).
                    The g means it's a global search, so it will replace all instances, not just the first one.
                    The replace method then replaces all those matched characters with nothing (''), effectively removing them from the string.
                    This even trims the value.
                    */
                    key = key.replace(/[^a-z0-9]/gi, '');
                    if (!isNaN(parseFloat(key))) {
                        key = '_' + key;
                    }
                    // Escape single quotes to avoid compilation errors
                    value = value.replace(/'/g, "\\'");
                    return `  ${key} = '${value}',`;
                }).join('\n');
                const enumText = `export enum ${enumName} {\n${enumOptions}}`;
                interfaceEnums.push(enumText);
                propertyDefinition = `${indentation}${propertyName}: ${enumName};\n`;
            }
            // -------------------------------------------------
            // Text, RichText, Email, UID
            // -------------------------------------------------
            else if (attributeValue.type === 'string' ||
                attributeValue.type === 'text' ||
                attributeValue.type === 'richtext' ||
                attributeValue.type === 'email' ||
                attributeValue.type === 'password' ||
                attributeValue.type === 'uid') {
                propertyType = 'string';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Json
            // -------------------------------------------------
            else if (attributeValue.type === 'json') {
                propertyType = 'any';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Password
            // -------------------------------------------------
            else if (attributeValue.type === 'password') {
                propertyDefinition = '';
            }
            // -------------------------------------------------
            // Number
            // -------------------------------------------------
            else if (attributeValue.type === 'integer' ||
                attributeValue.type === 'biginteger' ||
                attributeValue.type === 'decimal' ||
                attributeValue.type === 'float') {
                propertyType = 'number';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Date
            // -------------------------------------------------
            else if (attributeValue.type === 'date' || attributeValue.type === 'datetime' || attributeValue.type === 'time') {
                propertyType = 'Date';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Boolean
            // -------------------------------------------------
            else if (attributeValue.type === 'boolean') {
                propertyType = 'boolean';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            // -------------------------------------------------
            // Others
            // -------------------------------------------------
            else {
                propertyType = 'any';
                propertyDefinition = `${indentation}${propertyName}: ${propertyType};\n`;
            }
            interfaceText += propertyDefinition;
        }
        // -------------------------------------------------
        // Localization
        // -------------------------------------------------
        if (schemaInfo.schema.pluginOptions?.i18n?.localized) {
            interfaceText += `${indentation}locale: string;\n`;
            if (schemaType === schemaType_1.SchemaType.Standard) {
                interfaceText += `${indentation}localizations?: { data: ${schemaInfo.pascalName}[] };\n`;
            }
            else if (schemaType === schemaType_1.SchemaType.Plain) {
                interfaceText += `${indentation}localizations?: ${schemaInfo.pascalName}${plainClassSuffix}[];\n`;
            }
            else {
                interfaceText += `${indentation}localizations?: ${schemaInfo.pascalName}[];\n`;
            }
        }
        if ((schemaInfo.source === schemaSource_1.SchemaSource.Api || schemaInfo.source === schemaSource_1.SchemaSource.Extension) && schemaType === schemaType_1.SchemaType.Standard) {
            interfaceText += `  };\n`;
        }
        interfaceText += '}\n';
        return {
            interfaceText,
            interfaceDependencies,
            interfaceEnums
        };
    }
    /**
     * When looking for the schema info of the attribute of a component, it is necessary to look for it with
     * the Component suffix and without it.
     * A component name could end with the word 'Component' but not needing the suffix, so in this case the function
     * `isComponentWithoutSuffix` would return true.
     */
    getAttributeComponentInfo(propertyType, allSchemas) {
        function isComponentWithoutSuffix(schemaInfo) {
            return !schemaInfo.needsComponentSuffix && schemaInfo.pascalName === propertyType;
        }
        function isComponentWithSuffix(schemaInfo) {
            return schemaInfo.needsComponentSuffix && schemaInfo.pascalName === `${propertyType}Component`;
        }
        return allSchemas.find(schemaInfo => schemaInfo.source === schemaSource_1.SchemaSource.Component &&
            (isComponentWithoutSuffix(schemaInfo) || isComponentWithSuffix(schemaInfo)));
    }
    getInterfaceName(schemaInfo, schemaType) {
        let interfaceName = schemaInfo.pascalName;
        if (schemaType === schemaType_1.SchemaType.Plain) {
            interfaceName += plainClassSuffix;
        }
        else if (schemaType === schemaType_1.SchemaType.NoRelations) {
            interfaceName += noRelationsClassSuffix;
        }
        else if (schemaType === schemaType_1.SchemaType.AdminPanelLifeCycle) {
            interfaceName += adminPanelLifeCycleClassSuffix;
        }
        return interfaceName;
    }
    getImportPath(importPath, fileName) {
        let result = '';
        if (importPath === './') {
            result = `./${fileName}`;
        }
        else {
            result = path_1.default.join(importPath, fileName);
        }
        if (commonHelpers_1.CommonHelpers.isWindows()) {
            result = result.replaceAll('\\', '/');
        }
        return result;
    }
}
exports.InterfaceBuilder = InterfaceBuilder;
