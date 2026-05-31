import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload, type Jwt } from "jsonwebtoken";
import config from "../config";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & { id: number; name: string; role: string };
        }
    }
}

const authMiddleware = (...requireRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer")) {
                res.status(401).json({
                    success: false,
                    message: "unauthorized",
                    errors: "you are not authorized to access this route, token missing!"
                });
                return;
            }
            const token = authHeader.split(" ")[1];

            const decode = jwt.verify(
                token as string,
                config.jwt_secret as string

            ) as unknown as JwtPayload & { id: number; name: string; role: string };

            if (requireRoles.length > 0 && !requireRoles.includes(decode.role)) {
                res.status(403).json({
                    success: false,
                    message: "forbidden",
                    errors: "you do not have permission to perform this action"
                });
                return;
            }
            req.user = decode;
            next();


        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: "unauthorized",
                errors: error.message || "Invalid or expired token !"
            });
        }
    };
};
export { authMiddleware };