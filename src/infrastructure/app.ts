import express, { type Express, type Request, type Response } from "express";
import {
    registerUser,
    takeOneProductInStock,
    takeOneProductInStockAndSendCommand,
    updateUserName,
} from "../domains/useCase";
import { email, greaterThanOrEqual, lessThan, maxCharacters } from "../domains/constraints";
import type { EmailSender } from "../domains/ports";
import { ConsoleEmailSender } from "./emailSender";
import type { User } from "../domains/entities";
import type { ProductSheetRepository } from "../domains/repositories";
import type { MongoDbConnection } from "./mongodb";
import { MongoProductSheetRepository } from "./repositories/productSheet";
import { MongoUserRepository } from "./repositories/user";
import type { UserRepository } from "../domains/repositories/user";

function parseUserName(value: unknown): User["name"] | null {
    if (typeof value !== "string") {
        return null;
    }

    return maxCharacters(value, 12);
}

function parseSku(value: unknown): string | null {
    return typeof value === "string" && value.length > 0 ? value : null;
}

export function createApp(
    mongo: MongoDbConnection,
    userRepository: UserRepository = new MongoUserRepository(mongo),
    productSheetRepository: ProductSheetRepository = new MongoProductSheetRepository(mongo),
    emailSender: EmailSender = new ConsoleEmailSender(),
): Express {
    const app = express();

    app.disable("x-powered-by");
    app.use(express.json());

    app.get("/health", async (_request: Request, response: Response) => {
        try {
            await mongo.ping();
            response.status(200).json({ status: "ok", database: "ok" });
        } catch {
            response.status(503).json({ status: "error", database: "unavailable" });
        }
    });

    app.post("/users", async (request: Request, response: Response) => {
        const name = parseUserName(request.body?.name);
        const userEmail = typeof request.body?.email === "string" ? email(request.body.email) : null;

        if (name === null || userEmail === null) {
            response.status(400).json({
                error: "name must be a string of at most 12 characters and email a valid email",
            });
            return;
        }

        try {
            const result = await registerUser(userRepository, emailSender, { name, email: userEmail });

            if (!result.ok) {
                response.status(409).json({ error: result.reason });
                return;
            }

            response.status(201).json(result.user);
        } catch {
            response.status(500).json({ error: "Unable to register user" });
        }
    });

    app.patch("/users/:name", async (request: Request, response: Response) => {
        const currentName = parseUserName(request.params.name);
        const newName = parseUserName(request.body?.name);

        if (currentName === null || newName === null) {
            response.status(400).json({
                error: "The current name and the new name must be strings of at most 12 characters",
            });
            return;
        }

        try {
            const user = await userRepository.findByName(currentName);

            if (user === null) {
                response.status(404).json({ error: "User not found" });
                return;
            }

            const userWithNewName = await userRepository.findByName(newName);

            if (userWithNewName !== null && userWithNewName.email !== user.email) {
                response.status(409).json({ error: "NAME_ALREADY_USED" });
                return;
            }

            const updatedUser = await updateUserName(userRepository, user, newName);

            response.status(200).json(updatedUser);
        } catch {
            response.status(500).json({ error: "Unable to update user" });
        }
    });

    app.post("/product-sheets/:sku/take-one", async (request: Request, response: Response) => {
        try {
            const sku = parseSku(request.params.sku);

            if (sku === null) {
                response.status(400).json({ error: "SKU is required" });
                return;
            }

            const productSheet = await productSheetRepository.findOneBySku(sku);

            if (productSheet === null) {
                response.status(404).json({ error: "Product sheet not found" });
                return;
            }

            const quantityWithAtLeastTen = greaterThanOrEqual(productSheet.quantityInStock, 10);
            let updatedProductSheet;

            if (quantityWithAtLeastTen !== null) {
                updatedProductSheet = await takeOneProductInStock(
                    productSheetRepository,
                    { ...productSheet, quantityInStock: quantityWithAtLeastTen },
                );
            } else {
                const quantityWithLessThanTen = lessThan(productSheet.quantityInStock, 10);

                if (quantityWithLessThanTen === null) {
                    response.status(409).json({ error: "Invalid stock quantity" });
                    return;
                }

                updatedProductSheet = await takeOneProductInStockAndSendCommand(
                    productSheetRepository,
                    { ...productSheet, quantityInStock: quantityWithLessThanTen },
                );
            }

            response.status(200).json(updatedProductSheet);
        } catch {
            response.status(500).json({
                error: "Unable to update product stock and send command",
            });
        }
    });

    app.use((_request: Request, response: Response) => {
        response.status(404).json({ error: "Route not found" });
    });

    return app;
}
