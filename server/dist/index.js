"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const typeorm_1 = require("typeorm");
const cors_1 = __importDefault(require("cors"));
const posts_1 = require("./entities/posts");
const users_1 = require("./entities/users");
const Updoot_1 = require("./entities/Updoot");
const path_1 = __importDefault(require("path"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: 'postgres',
        database: 'liredit2',
        username: 'postgres',
        password: 'emmanuel',
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [posts_1.Post, users_1.User, Updoot_1.Updoot]
    });
    yield conn.runMigrations();
    console.log('ran');
    const app = express_1.default();
    const redisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default(6379, "localhost");
    app.use(cors_1.default({
        origin: "http://localhost:3000",
        credentials: true
    }));
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new redisStore({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 10 * 365,
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        },
        saveUninitialized: false,
        secret: "drmslfkcnmkngkfngmlfmgfefeffffmnknfknfkn",
        resave: false
    }));
    const apolloserver = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
    });
    apolloserver.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log('server is running on localhost 4000');
    });
});
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map