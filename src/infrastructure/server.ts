import { createApp } from "./app";
import { loadConfig } from "./config";
import { MongoDbConnection } from "./mongodb";
import { createUserRepository } from "./repositories";

const config = loadConfig();
const mongo = new MongoDbConnection(config.mongodbUri, config.mongodbDatabase);
const userRepository = createUserRepository(config.nodeEnv, {
    getMongo: () => mongo,
    getSqlClient: () => {
        throw new Error("No Postgres client configured: add `pg` and pass a pg.Pool here");
    },
});
const app = createApp(mongo, userRepository);

const server = app.listen(config.port, () => {
    console.log(`HTTP server listening on port ${config.port}`);
});

async function shutdown(signal: string): Promise<void> {
    console.log(`${signal} received, shutting down`);

    server.close(async (error) => {
        if (error !== undefined) {
            console.error("Failed to close HTTP server", error);
            process.exitCode = 1;
        }

        await mongo.close();
    });
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
