
import express from "express";
import cors from "cors";
import type { Application, Request, Response } from "express";
import { AuthRoutes } from "./modules/user/user.route";
import { issueRoutes } from "./modules/issue/issue.route";


const app: Application = express();

app.use(cors())
app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use('/api/issues', issueRoutes);


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to devpulse tracker API",
    })
})

export default app;