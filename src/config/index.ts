import dotenv from "dotenv";
import path from "path";
import fs from "fs";



const possiblePaths = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "../.env"),

];

let envLoaded = false;
let loadedPath = "";

for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
        console.log("Found .env at:", envPath);

        const fileContent = fs.readFileSync(envPath, "utf8");
        console.log("Raw .env content:");
        console.log(fileContent);

        const result = dotenv.config({ path: envPath });
        console.log("dotenv.config() result:", result);

        envLoaded = true;
        loadedPath = envPath;
        break;
    }
}

if (!envLoaded) {
    console.error("No .env file found");
    process.exit(1);
}

console.log("\n Manual parse check:");
const manualConfig = dotenv.parse(fs.readFileSync(loadedPath, "utf8"));

console.log("  Manual parse result:", manualConfig);
console.log("  Manual JWT_SECRET:", manualConfig.JWT_SECRET);

console.log("\n process.env.JWT_SECRET:", process.env.JWT_SECRET);

const config = {
    connection_string: process.env.DATABASE_URL as string,
    port: process.env.PORT || 5000,
    jwt_secret: process.env.JWT_SECRET as string,
};

if (!config.jwt_secret) {
    process.exit(1);
}

export default config;


