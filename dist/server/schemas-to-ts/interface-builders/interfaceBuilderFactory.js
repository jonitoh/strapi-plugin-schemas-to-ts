"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceBuilderFactory = void 0;
const postV414InterfaceBuilder_1 = require("./postV414InterfaceBuilder");
const preV414InterfaceBuilder_1 = require("./preV414InterfaceBuilder");
class InterfaceBuilderFactory {
    static getInterfaceBuilder(strapiVersion, commonHelpers, config) {
        commonHelpers.logger.debug(`Detected Strapi version ${strapiVersion} for interface building`);
        if (this.isStrapiVersionGreaterThanOrEqual(strapiVersion, '4.14')) {
            return new postV414InterfaceBuilder_1.PostV414InterfaceBuilder(commonHelpers, config);
        }
        else {
            return new preV414InterfaceBuilder_1.PreV414InterfaceBuilder(commonHelpers, config);
        }
    }
    static isStrapiVersionGreaterThanOrEqual(strapiVersion, version) {
        const strapiVersionParts = strapiVersion.split('.').map(Number);
        const versionParts = version.split('.').map(Number);
        for (let i = 0; i < Math.max(versionParts.length, strapiVersionParts.length); i++) {
            const versionPart = i < versionParts.length ? versionParts[i] : 0;
            const strapiVersionPart = i < strapiVersionParts.length ? strapiVersionParts[i] : 0;
            if (strapiVersionPart > versionPart) {
                return true;
            }
            if (strapiVersionPart < versionPart) {
                return false;
            }
        }
        return true; // Versions are equal
    }
}
exports.InterfaceBuilderFactory = InterfaceBuilderFactory;
