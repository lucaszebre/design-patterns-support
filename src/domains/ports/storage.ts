export interface StoragePort {
    get<GenericValue>(key: string): Promise<GenericValue | null>;
    set<GenericValue>(key: string, value: GenericValue): Promise<void>;
    remove(key: string): Promise<void>;
}

export class StorageError extends Error {
    public constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
        this.name = "StorageError";
    }
}
