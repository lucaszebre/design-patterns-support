import { Email, MaxCharacters } from "../constraints";

export interface User {
    name: string & MaxCharacters<12>
    email: string & Email
}
