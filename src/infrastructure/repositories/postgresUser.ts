import type { User } from "../../domains/entities";
import type { UserRepository } from "../../domains/repositories";

export interface SqlClient {
    query<Row>(sql: string, params: unknown[]): Promise<{ rows: Row[] }>;
}

type UserRow = { name: User["name"]; email: User["email"] };

export class PostgresUserRepository implements UserRepository {
    public constructor(private readonly sql: SqlClient) {}

    public async save(user: User): Promise<User> {
        await this.sql.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name",
            [user.name, user.email],
        );

        return user;
    }

    public async findByName(name: User["name"]): Promise<User | null> {
        const { rows } = await this.sql.query<UserRow>("SELECT name, email FROM users WHERE name = $1", [name]);

        return rows[0] ?? null;
    }

    public async findByEmail(email: User["email"]): Promise<User | null> {
        const { rows } = await this.sql.query<UserRow>("SELECT name, email FROM users WHERE email = $1", [email]);

        return rows[0] ?? null;
    }
}
