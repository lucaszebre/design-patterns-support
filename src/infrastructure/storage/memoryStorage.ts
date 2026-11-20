import type { StoragePort } from "../../domains/ports";

export class MemoryStorage implements StoragePort {
    private readonly values = new Map<string, unknown>();

    public async get<GenericValue>(key: string): Promise<GenericValue | null> {
        return this.values.has(key) ? structuredClone(this.values.get(key) as GenericValue) : null;
    }

    public async set<GenericValue>(key: string, value: GenericValue): Promise<void> {
        this.values.set(key, structuredClone(value));
    }

    public async remove(key: string): Promise<void> {
        this.values.delete(key);
    }
}
