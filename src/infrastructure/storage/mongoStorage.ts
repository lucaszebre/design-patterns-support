import type { Collection } from "mongodb";
import type { StoragePort } from "../../domains/ports";
import type { MongoDbConnection } from "../mongodb";

type StoredValue = { _id: string; value: unknown };

export class MongoStorage implements StoragePort {
    public constructor(
        private readonly mongo: MongoDbConnection,
        private readonly collectionName = "storage",
    ) {}

    private async getCollection(): Promise<Collection<StoredValue>> {
        const { db } = await this.mongo.connect();

        return db.collection<StoredValue>(this.collectionName);
    }

    public async get<GenericValue>(key: string): Promise<GenericValue | null> {
        const document = await (await this.getCollection()).findOne({ _id: key });

        return document === null ? null : (document.value as GenericValue);
    }

    public async set<GenericValue>(key: string, value: GenericValue): Promise<void> {
        await (await this.getCollection()).replaceOne({ _id: key }, { value }, { upsert: true });
    }

    public async remove(key: string): Promise<void> {
        await (await this.getCollection()).deleteOne({ _id: key });
    }
}
