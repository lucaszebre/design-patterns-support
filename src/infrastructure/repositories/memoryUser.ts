import type { User } from "../../domains/entities";
import type { UserRepository } from "../../domains/repositories";

export class MemoryUserRepository implements UserRepository {
    public readonly users: User[] = [];

    public async save(user: User): Promise<User> {
        const index = this.users.findIndex((stored) => stored.email === user.email);

        if (index === -1) {
            this.users.push({ ...user });
        } else {
            this.users[index] = { ...user };
        }

        return user;
    }

    public async findByName(name: User["name"]): Promise<User | null> {
        const user = this.users.find((stored) => stored.name === name);

        return user === undefined ? null : { ...user };
    }

    public async findByEmail(email: User["email"]): Promise<User | null> {
        const user = this.users.find((stored) => stored.email === email);

        return user === undefined ? null : { ...user };
    }
}
