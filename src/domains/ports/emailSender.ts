import { User } from "../entities";

export interface EmailSender {
    send(to: User["email"], subject: string, body: string): Promise<void>
}
