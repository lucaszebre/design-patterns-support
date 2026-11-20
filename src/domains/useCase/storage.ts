import { Post, User } from "../entities"
import { StoragePort } from "../ports"

export function saveUser(storage: StoragePort, user: User) {
    return storage.set("user", user)
}

export function getUser(storage: StoragePort) {
    return storage.get<User>("user")
}

export function savePost(storage: StoragePort, post: Post) {
    return storage.set("post", post)
}
