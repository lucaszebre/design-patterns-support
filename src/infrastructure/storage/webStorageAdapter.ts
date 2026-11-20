import { StorageError, type StoragePort } from "../../domains/ports";

export interface WebStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export class WebStorageAdapter implements StoragePort {
    public constructor(private readonly storage: WebStorage) {}

    public async get<GenericValue>(key: string): Promise<GenericValue | null> {
        try {
            const value = this.storage.getItem(key);

            return value === null ? null : (JSON.parse(value) as GenericValue);
        } catch (error) {
            throw new StorageError(`Unable to read "${key}"`, { cause: error });
        }
    }

    public async set<GenericValue>(key: string, value: GenericValue): Promise<void> {
        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            throw new StorageError(`Unable to write "${key}"`, { cause: error });
        }
    }

    public async remove(key: string): Promise<void> {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            throw new StorageError(`Unable to remove "${key}"`, { cause: error });
        }
    }
}
