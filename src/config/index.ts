import dotenv from "dotenv";

dotenv.config();

const config = {
    connection_string: process.env.DATABASE_URL as string,
    port: process.env.PORT || 5000,
    jwt_secret: process.env.JWT_SECRET as string,
};

if (!config.jwt_secret) {
    console.log("fatal: JWT_SECRET is not defined in enviroment variable!");
    process.exit(1);
}


if (!config.connection_string) {
    console.error("fatal: DATABASE_URL is not defined in enviroment variable!");
    process.exit(1);
}

export default config;