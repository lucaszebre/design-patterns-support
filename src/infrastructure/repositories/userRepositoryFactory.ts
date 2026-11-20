import type { UserRepository } from "../../domains/repositories";
import type { MongoDbConnection } from "../mongodb";
import { MemoryUserRepository } from "./memoryUser";
import { PostgresUserRepository, type SqlClient } from "./postgresUser";
import { MongoUserRepository } from "./user";

export interface UserRepositoryFactoryDependencies {
    getSqlClient: () => SqlClient;
    getMongo: () => MongoDbConnection;
}

export function createUserRepository(
    nodeEnv: string,
    dependencies: UserRepositoryFactoryDependencies,
): UserRepository {
    switch (nodeEnv) {
        case "production":
            return new PostgresUserRepository(dependencies.getSqlClient());
        case "development":
            return new MongoUserRepository(dependencies.getMongo());
        case "test":
            return new MemoryUserRepository();
        default:
            throw new Error(`Unknown NODE_ENV "${nodeEnv}" (expected production, development or test)`);
    }
}
