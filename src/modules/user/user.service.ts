import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { pool } from "../../db";
import type { TUser } from "./user.interface";
import config from "../../config";


const getUserByEmail = async (email: string): Promise<TUser | null> => {
    const queryString = "SELECT * FROM users WHERE email = $1;"
    const result = await pool.query(queryString, [email]);

    if (result.rows.length === 0) {
        return null
    }
    return result.rows[0];
}

const createUserIntoDB = async (userData: TUser): Promise<TUser | null> => {
    const { name, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password as string, 10);

    const queryStr = `
        INSERT INTO users (name,email,password, role)
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at;
        `

    const values = [name, email, hashedPassword, role || 'contributor'];
    const result = await pool.query(queryStr, values);
    return result.rows[0];
}

//login

const loginUser = async (email: string, password: string) => {

    const user = await getUserByEmail(email);

    if (!user) {
        return null;
    }
    if (!user.password) {
        throw new Error("User password not found")
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return null;
    }

    const jwt_secret = config.jwt_secret;
    if (!jwt_secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        jwt_secret,
        { expiresIn: '1d' }

    );

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword }
}

export const UserServices = {
    getUserByEmail,
    createUserIntoDB,
    loginUser,
}


