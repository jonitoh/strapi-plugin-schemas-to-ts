"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationPaths = void 0;
const path_1 = __importDefault(require("path"));
const fileHelpers_1 = require("../schemas-to-ts/fileHelpers");
const pluginName_1 = require("./pluginName");
class DestinationPaths {
    constructor(config, strapiPaths) {
        this.componentInterfacesFolderName = 'interfaces';
        this.extensionsFolderName = 'extensions';
        this.apisFolderName = 'api';
        this.commonFolderName = 'common';
        this.componentsFolderName = 'components';
        let useDefaultFolders = true;
        let destinationFolder = config.destinationFolder;
        if (destinationFolder) {
            destinationFolder = this.getFinalDestinationFolder(destinationFolder, strapiPaths);
            config.destinationFolder = destinationFolder;
            this.commons = fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.commonFolderName);
            this.apis = fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.apisFolderName);
            this.components = fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(destinationFolder, this.componentsFolderName);
            useDefaultFolders = false;
        }
        if (useDefaultFolders) {
            this.commons = fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(strapiPaths.app.src, this.commonFolderName, config.commonInterfacesFolderName);
        }
        this.useCustomDestinationFolder = !!destinationFolder;
    }
    getFinalDestinationFolder(destinationFolder, strapiPaths) {
        if (destinationFolder.startsWith(strapiPaths.app.root)) {
            destinationFolder = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.app.root);
        }
        destinationFolder = path_1.default.join(strapiPaths.app.root, destinationFolder);
        this.assertDestinationIsInsideStrapi(destinationFolder, strapiPaths);
        destinationFolder = fileHelpers_1.FileHelpers.normalizeWithoutTrailingSeparator(destinationFolder);
        this.assertDestinationIsNotStrapiCoreFolder(destinationFolder, strapiPaths);
        const relativeRoute = this.removeStrapiRootPathFromFullPath(destinationFolder, strapiPaths.app.root);
        const folders = relativeRoute.split(path_1.default.sep).filter(part => part !== '');
        destinationFolder = fileHelpers_1.FileHelpers.ensureFolderPathExistRecursive(strapiPaths.app.root, ...folders);
        return destinationFolder;
    }
    assertDestinationIsInsideStrapi(destinationFolder, strapiPaths) {
        if (!destinationFolder.startsWith(strapiPaths.app.root)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The destination folder is not inside the Strapi project: '${destinationFolder}'`);
        }
    }
    removeStrapiRootPathFromFullPath(destinationFolder, strapiRootPath) {
        return path_1.default.relative(strapiRootPath, destinationFolder);
    }
    assertDestinationIsNotStrapiCoreFolder(destinationFolder, strapiPaths) {
        if (destinationFolder === strapiPaths.app.root) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is the same as the Strapi root`);
        }
        if (destinationFolder === strapiPaths.app.src) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is the same as the Strapi src`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.api)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi api`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.components)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi components`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.extensions)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi extensions`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.policies)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi policies`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.middlewares)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi middlewares`);
        }
        if (destinationFolder.startsWith(strapiPaths.app.config)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi config`);
        }
        if (destinationFolder.startsWith(strapiPaths.dist.root)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi dist`);
        }
        if (destinationFolder.startsWith(strapiPaths.static.public)) {
            throw new Error(`${pluginName_1.pluginName} ⚠️  The given destinationFolder is inside the Strapi static`);
        }
    }
}
exports.DestinationPaths = DestinationPaths;
