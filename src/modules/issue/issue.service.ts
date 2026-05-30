import { pool } from "../../db";
import type { IIssue } from "./issue.interface";

export const insertIssueIntoDB = async (issueData: IIssue) => {
    const { title, description, type, reporter_id } = issueData;

    const query = `
    INSERT INTO issues (title, description, type, reporter_id)
    values($1, $2, $3, $4)
    RETURNING *;
    `;

    const values = [title, description, type, reporter_id];
    const result = await pool.query(query, values);
    return result.rows[0];

}

// get ALL Issues

export const getAllIssuesFromDB = async (sort: string = 'newest', type?: string, status?: string) => {
    let query = 'SELECT * FROM issues';
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (type) {
        conditions.push(`type=$${queryParams.length + 1}`);
        queryParams.push(type);
    }

    if (status) {
        conditions.push(`status = $${queryParams.length + 1}`);
        queryParams.push(status);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';
    query += ` ORDER BY created_at ${orderBy}`;

    const issuesResult = await pool.query(query, queryParams);

    const issuesWithReporter = [];
    for (const issue of issuesResult.rows) {
        const reporterResult = await pool.query(
            'SELECT id, name, role FROM users WHERE id = $1',
            [issue.reporter_id]
        );
        issuesWithReporter.push({
            ...issue,
            reporter: reporterResult.rows[0]
        });
    }
    return issuesWithReporter;
}

//get single Issue By ID

export const getIssuesByIdFromDB = async (id: number) => {
    const query = 'SELECT * FROM issues WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
        return null;
    }

    const issue = result.rows[0];

    const reporterResult = await pool.query(
        'SELECT id, name, role FROM users WHERE id = $1',
        [issue.reporter_id]
    );
    return {
        ...issue,
        reporter: reporterResult.rows[0]
    };
}

//update issue

export const updateIssueInDB = async (id: number, updates: Partial<IIssue>) => {
    const allowFields = ['title', 'description', 'type', 'status'];

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    for (const field of allowFields) {
        if (updates[field as keyof IIssue] !== undefined) {
            updateFields.push(`${field} = $${paramCounter++}`);
            values.push(updates[field as keyof IIssue]);
        }
    }

    if (updateFields.length === 0) {
        return null;
    }

    values.push(id);
    const query = `
    UPDATE issues
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCounter}
    RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];

}

export const deleteIssueFromDB = async (id: number) => {
    const query = 'DELETE FROM issues WHERE id =$1 RETURNING id';

    const result = await pool.query(query, [id]);
    return result.rows[0];
}