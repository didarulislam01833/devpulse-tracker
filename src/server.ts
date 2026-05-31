import 'dotenv/config';
import app from "./app";
import config from "./config";
import { initDB } from './db';

async function main() {
    try {
        await initDB();

        app.listen(config.port, () => {
            console.log(`Server is running on the port ${config.port}`)
        })
    } catch (error) {
        console.log("Main server error: ,error");
        process.exit(1);
    }
}

main();