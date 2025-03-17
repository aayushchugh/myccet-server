import { eq, and, isNull } from "drizzle-orm";
import db from "../db";
import {
	adminTable,
	userTable,
	Role,
	Admin,
	Designation,
} from "../db/schema/user";
import { createBaseUser, updateBaseUser, softDeleteUser } from "./user.service";
import logger from "../libs/logger";

/**
 * Create a new admin
 */
export async function createAdmin(adminData: {
	email: string;
	password: string;
	first_name: string;
	middle_name?: string;
	last_name?: string;
	phone: number;
	designation: Designation;
}): Promise<number> {
	// Create base user with admin role
	const userId = await createBaseUser({
		...adminData,
		role: Role.ADMIN,
	});

	// Create admin record
	const [admin] = await db
		.insert(adminTable)
		.values({
			user_id: userId,
			designation: adminData.designation,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning({ id: adminTable.id });

	logger.info(`Admin account created with email: ${adminData.email}`, "ADMIN");

	return admin.id;
}

/**
 * Get all admins with their user details
 */
export async function getAllAdmins() {
	const admins = await db
		.select({
			id: userTable.id,
			email: userTable.email,
			first_name: userTable.first_name,
			middle_name: userTable.middle_name,
			last_name: userTable.last_name,
			phone: userTable.phone,
			designation: adminTable.designation,
		})
		.from(userTable)
		.innerJoin(adminTable, eq(userTable.id, adminTable.user_id))
		.where(and(eq(userTable.role, Role.ADMIN), isNull(userTable.deleted_at)));

	return admins;
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: number) {
	const [admin] = await db
		.select({
			id: userTable.id,
			email: userTable.email,
			first_name: userTable.first_name,
			middle_name: userTable.middle_name,
			last_name: userTable.last_name,
			phone: userTable.phone,
			designation: adminTable.designation,
		})
		.from(userTable)
		.innerJoin(adminTable, eq(userTable.id, adminTable.user_id))
		.where(and(eq(userTable.id, id), isNull(userTable.deleted_at)));

	return admin || null;
}

/**
 * Update admin
 */
export async function updateAdmin(
	id: number,
	adminData: {
		email?: string;
		first_name?: string;
		middle_name?: string | null;
		last_name?: string | null;
		phone?: number;
		designation?: Designation;
	}
) {
	// Extract designation from adminData
	const { designation, ...userData } = adminData;

	// Update base user information
	const updatedUser = await updateBaseUser(id, userData);

	if (!updatedUser) {
		return null;
	}

	// Update admin-specific information if designation is provided
	if (designation) {
		await db
			.update(adminTable)
			.set({
				designation,
				updated_at: new Date(),
			})
			.where(eq(adminTable.user_id, id));
	}

	// Get updated admin
	return getAdminById(id);
}

/**
 * Delete admin
 */
export async function deleteAdmin(id: number): Promise<boolean> {
	return softDeleteUser(id);
}
