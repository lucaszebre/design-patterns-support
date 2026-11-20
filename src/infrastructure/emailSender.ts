import type { User } from "../domains/entities";
import type { EmailSender } from "../domains/ports";

export class ConsoleEmailSender implements EmailSender {
    public async send(to: User["email"], subject: string, body: string): Promise<void> {
        console.log(`[email] to=${to} subject="${subject}"\n${body}`);
    }
}
