"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pluginName_1 = require("./models/pluginName");
const converter_1 = require("./schemas-to-ts/converter");
exports.default = ({ strapi }) => {
    const config = strapi.config.get(`plugin.${pluginName_1.pluginName}`);
    const converter = new converter_1.Converter(config, strapi.config.info.strapi, strapi.dirs);
    converter.SchemasToTs();
};
