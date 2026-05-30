import express from "express"

import { userController } from "./user.controller";


const router = express.Router();

router.post("/signup", userController.userRegister);
router.post("/login", userController.userLogin);

export const AuthRoutes = router;