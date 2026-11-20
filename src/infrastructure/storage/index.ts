import { StorageError, type StoragePort } from "../../domains/ports";
import type { MongoDbConnection } from "../mongodb";
import { MemoryStorage } from "./memoryStorage";
import { MongoStorage } from "./mongoStorage";
import { WebStorageAdapter, type WebStorage } from "./webStorageAdapter";

export * from "./memoryStorage";
export * from "./mongoStorage";
export * from "./webStorageAdapter";

export type StorageKind = "localStorage" | "sessionStorage" | "database" | "memory";

function getBrowserStorage(name: "localStorage" | "sessionStorage"): WebStorage {
    const storage = (globalThis as Record<string, unknown>)[name] as WebStorage | undefined;

    if (storage === undefined) {
        throw new StorageError(`${name} is not available here`);
    }

    return storage;
}

export function createStorage(kind: StorageKind, mongo?: MongoDbConnection): StoragePort {
    switch (kind) {
        case "localStorage":
        case "sessionStorage":
            return new WebStorageAdapter(getBrowserStorage(kind));
        case "database":
            if (mongo === undefined) {
                throw new StorageError("The database storage needs a MongoDB connection");
            }
            return new MongoStorage(mongo);
        case "memory":
            return new MemoryStorage();
    }
}
