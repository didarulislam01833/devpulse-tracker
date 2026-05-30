import { Pool } from "pg";
import config from "../config";
import { createIssuesTable } from "./schema";

export const pool = new Pool({
    connectionString: config.connection_string,
})

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
             id SERIAL PRIMARY KEY,
             name VARCHAR (100) NOT NULL,
             email VARCHAR(150) UNIQUE NOT NULL,
             password TEXT NOT NULL,
             role VARCHAR(20) DEFAULT 'contributor',
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);

        await pool.query(createIssuesTable);
        console.log("Database table created successfully")
    } catch (error) {
        console.error("Error initializing database tables:", error)
    }
}