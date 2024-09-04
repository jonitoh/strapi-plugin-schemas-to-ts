"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHelpers = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commonHelpers_1 = require("./commonHelpers");
class FileHelpers {
    static normalizeWithoutTrailingSeparator(folderPath) {
        folderPath = path_1.default.normalize(folderPath);
        if (folderPath.endsWith(path_1.default.sep)) {
            folderPath = folderPath.slice(0, -1);
        }
        return folderPath;
    }
    static ensureFolderPathExistRecursive(srcFolderPath, ...subfolders) {
        let folder = srcFolderPath;
        for (const subfolder of subfolders) {
            folder = path_1.default.join(folder, subfolder);
            if (!fs_1.default.existsSync(folder)) {
                fs_1.default.mkdirSync(folder);
            }
        }
        return folder;
    }
    static folderExists(folderPath) {
        try {
            return fs_1.default.statSync(folderPath).isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    static fileExists(filePath) {
        try {
            return fs_1.default.statSync(filePath).isFile();
        }
        catch {
            return false;
        }
    }
    static writeInterfaceFile(folderPath, fileName, interfacesFileContent, logger) {
        let writeFile = true;
        const destinationPath = path_1.default.join(folderPath, fileName);
        if (FileHelpers.fileExists(destinationPath)) {
            const fileContent = fs_1.default.readFileSync(destinationPath, 'utf8');
            if (fileContent === interfacesFileContent) {
                logger.debug(`File ${destinationPath} is up to date.`);
                writeFile = false;
            }
        }
        if (writeFile) {
            logger.debug(`Writing file ${destinationPath}`);
            fs_1.default.writeFileSync(destinationPath, interfacesFileContent, 'utf8');
        }
        return destinationPath;
    }
    static getRelativePath(fromPath, toPath) {
        let stat = fs_1.default.statSync(fromPath);
        if (stat.isDirectory()) {
            // path.relative works better with file paths, so we add an unexisting file to the route
            fromPath += '/.dumbFile.txt';
        }
        stat = fs_1.default.statSync(toPath);
        if (stat.isDirectory()) {
            toPath += '/.dumbFile.txt';
        }
        const relativePath = path_1.default.relative(path_1.default.dirname(fromPath), path_1.default.dirname(toPath));
        return relativePath === '' ? './' : relativePath;
    }
    static deleteUnnecessaryGeneratedInterfaces(strapiDirectories, logger, filesToKeep) {
        filesToKeep = filesToKeep ?? [];
        // Array of exact paths to exclude
        const excludedPaths = [
            path_1.default.join(strapiDirectories.app.root, 'node_modules'),
            path_1.default.join(strapiDirectories.app.root, 'public'),
            path_1.default.join(strapiDirectories.app.root, 'database'),
            path_1.default.join(strapiDirectories.app.root, 'dist'),
            path_1.default.join(strapiDirectories.app.src, 'plugins'),
            path_1.default.join(strapiDirectories.app.src, 'admin'),
        ];
        logger.verbose('excludedPaths', excludedPaths);
        // Function to recursively search for files
        function searchFiles(dir) {
            logger.verbose('Looking for files to delete in ', path_1.default.resolve(dir));
            // Skip the directory if it's in the excluded paths or begins with '.' (.git, .cache, .vscode...)
            if (excludedPaths.includes(path_1.default.resolve(dir)) || path_1.default.basename(dir).startsWith('.')) {
                return;
            }
            const files = fs_1.default.readdirSync(dir);
            for (const file of files) {
                const filePath = path_1.default.join(dir, file);
                const stat = fs_1.default.statSync(filePath);
                if (stat.isDirectory()) {
                    searchFiles(filePath); // Recursively search in sub-directory
                }
                else if (filesToKeep.includes(filePath)) {
                    return;
                }
                else if (path_1.default.extname(file) === '.ts') {
                    checkAndDeleteFile(filePath);
                }
            }
        }
        // Function to check the first line of the file and delete if it matches
        function checkAndDeleteFile(filePath) {
            const firstLine = fs_1.default.readFileSync(filePath, 'utf8').split('\n')[0];
            if (commonHelpers_1.CommonHelpers.compareIgnoringLineBreaks(firstLine, commonHelpers_1.CommonHelpers.headerComment)) {
                fs_1.default.unlinkSync(filePath); // Delete the file
                logger.debug(`Deleted: ${filePath}`);
            }
        }
        // Start the search
        searchFiles(strapiDirectories.app.root);
    }
    static buildStrapiDirectoriesFromRootPath(strapiRootPath) {
        strapiRootPath = this.normalizeWithoutTrailingSeparator(strapiRootPath);
        const srcPath = path_1.default.join(strapiRootPath, 'src');
        return {
            dist: {
                root: path_1.default.join(strapiRootPath, "dist"),
                src: undefined,
                api: undefined,
                components: undefined,
                extensions: undefined,
                policies: undefined,
                middlewares: undefined,
                config: undefined,
            },
            app: {
                root: strapiRootPath,
                src: srcPath,
                api: path_1.default.join(srcPath, "api"),
                components: path_1.default.join(srcPath, "components"),
                extensions: path_1.default.join(srcPath, "extensions"),
                policies: path_1.default.join(srcPath, "policies"),
                middlewares: path_1.default.join(srcPath, "middlewares"),
                config: path_1.default.join(strapiRootPath, "config"),
            },
            static: {
                public: path_1.default.join(strapiRootPath, "public"),
            }
        };
    }
}
exports.FileHelpers = FileHelpers;
