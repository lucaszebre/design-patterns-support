import { Constraint } from "./base";

export interface Email extends Constraint<"email"> {

}

export function email(
    input: string
): (
    | (string & Email)
    | null
) {
    const value = input.trim().toLowerCase()

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return value as never
    }

    return null
}
