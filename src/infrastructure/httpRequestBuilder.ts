export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequest {
    readonly method: HttpMethod;
    readonly url: string;
    readonly headers: Record<string, string>;
    readonly body: string | undefined;
    readonly timeoutMs: number | undefined;
}

export class HttpRequestBuilder {
    private readonly headers: Record<string, string> = {};
    private readonly queryParams = new URLSearchParams();
    private body: string | undefined;
    private timeoutMs: number | undefined;

    public constructor(
        private readonly method: HttpMethod,
        private readonly url: string,
    ) {}

    public header(name: string, value: string): this {
        this.headers[name.toLowerCase()] = value;
        return this;
    }

    public query(name: string, value: string): this {
        this.queryParams.append(name, value);
        return this;
    }

    public json(value: unknown): this {
        this.body = JSON.stringify(value);
        return this.header("Content-Type", "application/json");
    }

    public timeout(milliseconds: number): this {
        this.timeoutMs = milliseconds;
        return this;
    }

    public build(): HttpRequest {
        const url = new URL(this.url);

        if (this.method === "GET" && this.body !== undefined) {
            throw new Error("A GET request cannot have a body");
        }

        this.queryParams.forEach((value, name) => url.searchParams.append(name, value));

        return {
            method: this.method,
            url: url.toString(),
            headers: { ...this.headers },
            body: this.body,
            timeoutMs: this.timeoutMs,
        };
    }
}

export function send(request: HttpRequest): Promise<Response> {
    return fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: request.timeoutMs === undefined ? undefined : AbortSignal.timeout(request.timeoutMs),
    });
}
