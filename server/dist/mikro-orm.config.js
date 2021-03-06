"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const posts_1 = require("./entities/posts");
const path_1 = __importDefault(require("path"));
const Users_1 = require("./entities/Users");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [posts_1.Post, Users_1.User],
    dbName: 'lireddit',
    user: 'postgres',
    password: 'emmanuel',
    debug: !constants_1.__prod__,
    type: 'postgresql'
};
//# sourceMappingURL=mikro-orm.config.js.map