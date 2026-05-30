import type { Request, Response } from "express";
import { deleteIssueFromDB, getAllIssuesFromDB, getIssuesByIdFromDB, insertIssueIntoDB, updateIssueInDB } from "./issue.service";

// create Issue
export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, type } = req.body;
        const reporter_id = req.user?.id;
        //validation
        if (!title || !description || !type) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                errors: "Title, description and type are required"
            });
            return;
        }

        if (title.length > 150) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                errors: "Title cannot exceed 150 characters"
            });
            return;
        }

        if (description.length < 20) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                errors: "description must be at least 20 characters"
            });
            return;
        }

        if (!reporter_id) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
                errors: "User not authorized"
            });
            return;
        }

        const result = await insertIssueIntoDB({
            title,
            description,
            type,
            reporter_id
        })

        res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result,
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "failed to create issue",
            errors: error.message
        });
    }
};

// get all issue

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sort = 'newest', type, status } = req.query
        const issues = await getAllIssuesFromDB(
            sort as string,
            type as string,
            status as string
        );

        res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: issues
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve successfully",
            errors: error.message
        });
    }
};


//single issue
export const getSingleIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                error: " Invalid Issue ID"
            });
            return;
        }

        const issue = await getIssuesByIdFromDB(id);

        if (!issue) {
            res.status(404).json({
                success: false,
                message: "Not Found",
                error: "Issues not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Issues retrieved Successfully",
            data: issue
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve issues",
            errors: error.message
        });
    }
};

//update issue

export const updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {

        const id = parseInt(req.params.id as string);
        const updates = req.body;
        const user = req.user;

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                error: " Invalid Issue ID"
            });
            return;
        }

        const existingIssue = await getIssuesByIdFromDB(id);

        if (!existingIssue) {
            res.status(404).json({
                success: false,
                message: "Not Found",
                error: "Issues not found"
            });
            return;
        };

        const isMaintainer = user?.role === 'maintainer';
        const isOwner = existingIssue.reporter_id === user?.id;

        if (!isMaintainer && !isOwner) {
            res.status(403).json({
                success: false,
                message: "Forbidden",
                errors: "You can only update your own issue"
            });
            return;
        }

        if (!isMaintainer && existingIssue.status !== 'open') {
            res.status(409).json({
                success: false,
                message: "Conflict",
                error: "You can only update issues with open status"
            });
            return;
        }

        const updateIssue = await updateIssueInDB(id, updates);

        res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: updateIssue
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update issue",
            errors: error.message
        });
    }
}
//delete
export const deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {

        const id = parseInt(req.params.id as string);
        const user = req.user;

        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                message: "Validation Errors",
                error: " Invalid Issue ID"
            });
            return;
        }

        const existingIssue = await getIssuesByIdFromDB(id);

        if (!existingIssue) {
            res.status(404).json({
                success: false,
                message: "Not Found",
                error: "Issues not found"
            });
            return;
        };


        if (user?.role !== 'maintainer') {
            res.status(403).json({
                success: false,
                message: "Forbidden",
                errors: " Only Maintainer can delete issue"
            });
            return;
        }

        await deleteIssueFromDB(id);
        res.status(200).json({
            success: true,
            message: "Issue Deleted Successfully",
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete issue",
            errors: error.message
        });
    }
};



