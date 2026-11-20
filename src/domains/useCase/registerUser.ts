import { User } from "../entities"
import { EmailSender } from "../ports"
import { UserRepository } from "../repositories"

export type RegisterUserResult =
    | { ok: true, user: User }
    | { ok: false, reason: "EMAIL_ALREADY_USED" | "NAME_ALREADY_USED" }

export async function registerUser(
    userRepository: UserRepository,
    emailSender: EmailSender,
    data: User,
): Promise<RegisterUserResult> {
    if (await userRepository.findByEmail(data.email) !== null) {
        return { ok: false, reason: "EMAIL_ALREADY_USED" }
    }

    if (await userRepository.findByName(data.name) !== null) {
        return { ok: false, reason: "NAME_ALREADY_USED" }
    }

    const user: User = {
        name: data.name,
        email: data.email,
    }

    await userRepository.save(user)
    await emailSender.send(user.email, "Welcome!", `Hello ${user.name}, your account has been created.`)

    return { ok: true, user }
}
