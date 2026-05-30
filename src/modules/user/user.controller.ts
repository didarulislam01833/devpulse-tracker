import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserServices } from "./user.service";
import jwt from "jsonwebtoken";
import config from "../../config";


const userRegister = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: "Name, email and password are required"
            });
            return;
        }

        const isUserExist = await UserServices.getUserByEmail(email);

        if (isUserExist) {
            res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: "email are already registered"
            });
            return;
        }

        const result = await UserServices.createUserIntoDB({ name, email, password, role });

        res.status(201).json({
            success: true,
            message: "Users Registered Successfully ",
            data: result,
        });



    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message || error
        });

    }
}

const userLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: "Email & password required"
            });
            return;
        }

        const user = await UserServices.getUserByEmail(email);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "Not Found",
                errors: "Users not found with this email"
            });
            return;
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password as string);
        if (!isPasswordMatched) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "Invalid Credintials"
            });
            return;
        }

        const jwtPayload = {
            id: user.id,
            name: user.name,
            role: user.role
        };

        const token = jwt.sign(
            jwtPayload,
            config.jwt_secret,
            { expiresIn: "1d" }
        );

        const userData = { ...user };

        res.status(200).json({
            success: true,
            message: "Login Successful",
            data: {
                token,
                user: userData
            }
        });


    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: error.message || error
        });

    }
}


export const userController = {
    userRegister,
    userLogin,
}