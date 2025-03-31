import { subjectTable } from "../db/schema/subject";
import db from "../db";
import { eq } from "drizzle-orm";
import logger from "../libs/logger";

export async function createSubject(data: { title: string; code: string }) {
	try {
		const [subject] = await db
			.insert(subjectTable)
			.values({
				title: data.title,
				code: data.code,
			})
			.returning();

		logger.info(`Subject created with title: ${data.title}`, "SYSTEM");

		return subject;
	} catch (err) {
		logger.error(`Error creating subject: ${err}`, "SYSTEM");
		throw err;
	}
}

export async function getAllSubjects() {
	try {
		const subjects = await db.select().from(subjectTable);
		return subjects;
	} catch (err) {
		logger.error(`Error fetching subjects: ${err}`, "SYSTEM");
		throw err;
	}
}

export async function getSubjectById(id: number) {
	try {
		const [subject] = await db
			.select()
			.from(subjectTable)
			.where(eq(subjectTable.id, id));

		return subject;
	} catch (err) {
		logger.error(`Error fetching subject: ${err}`, "SYSTEM");
		throw err;
	}
}

export async function updateSubject(
	id: number,
	data: {
		title?: string;
		code?: string;
	}
) {
	try {
		const [subject] = await db
			.update(subjectTable)
			.set({
				title: data.title,
				code: data.code,
				updated_at: new Date(),
			})
			.where(eq(subjectTable.id, id))
			.returning();

		if (subject) {
			logger.info(`Subject updated with id: ${id}`, "SYSTEM");
		}

		return subject;
	} catch (err) {
		logger.error(`Error updating subject: ${err}`, "SYSTEM");
		throw err;
	}
}

export async function deleteSubject(id: number) {
	try {
		const [subject] = await db
			.delete(subjectTable)
			.where(eq(subjectTable.id, id))
			.returning();

		if (subject) {
			logger.info(`Subject deleted with id: ${id}`, "SYSTEM");
			return true;
		}

		return false;
	} catch (err) {
		logger.error(`Error deleting subject: ${err}`, "SYSTEM");
		throw err;
	}
}

export async function checkSubjectExists(title?: string, code?: string) {
	try {
		if (!title && !code) return false;

		const conditions = [];
		if (title) conditions.push(eq(subjectTable.title, title));
		if (code) conditions.push(eq(subjectTable.code, code));

		const [subject] = await db
			.select()
			.from(subjectTable)
			.where(
				conditions.length > 1 ? conditions[0] || conditions[1] : conditions[0]
			);

		return !!subject;
	} catch (err) {
		logger.error(`Error checking subject existence: ${err}`, "SYSTEM");
		throw err;
	}
}
