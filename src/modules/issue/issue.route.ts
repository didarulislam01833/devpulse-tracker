import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth";
import { createIssue, deleteIssue, getAllIssues, getSingleIssue, updateIssue } from "./issue.controller";


const router = Router();

router.get("/", getAllIssues);
router.get("/:id", getSingleIssue);


router.post('/', authMiddleware("contributor", "maintainer"), createIssue);
router.patch('/:id', authMiddleware("contributor", "maintainer"), updateIssue);
router.delete('/:id', authMiddleware("maintainer"), deleteIssue);

export const issueRoutes = router;