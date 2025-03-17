import { eq, and, isNull, or } from "drizzle-orm";
import { compare, genSalt, hash } from "bcryptjs";
import db from "../db";
import { User, userTable, Role } from "../db/schema/user";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = await genSalt(10);
	return hash(password, salt);
}

/**
 * Check if a user with the given email or phone already exists
 */
export async function checkUserExists(
	email: string,
	phone: number
): Promise<boolean> {
	const existingUsers = await db
		.select({ id: userTable.id })
		.from(userTable)
		.where(
			and(
				isNull(userTable.deleted_at),
				or(eq(userTable.email, email), eq(userTable.phone, phone))
			)
		);

	return existingUsers.length > 0;
}

/**
 * Create a base user
 */
export async function createBaseUser(userData: {
	email: string;
	password: string;
	first_name: string;
	middle_name?: string;
	last_name?: string;
	phone: number;
	role: Role;
}): Promise<number> {
	const hashedPassword = await hashPassword(userData.password);

	const [user] = await db
		.insert(userTable)
		.values({
			email: userData.email,
			password: hashedPassword,
			first_name: userData.first_name,
			middle_name: userData.middle_name,
			last_name: userData.last_name,
			phone: userData.phone,
			role: userData.role,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning({ id: userTable.id });

	return user.id;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
	const [user] = await db
		.select()
		.from(userTable)
		.where(and(eq(userTable.id, id), isNull(userTable.deleted_at)));

	return user || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
	const [user] = await db
		.select()
		.from(userTable)
		.where(and(eq(userTable.email, email), isNull(userTable.deleted_at)));

	return user || null;
}

/**
 * Soft delete a user
 */
export async function softDeleteUser(id: number): Promise<boolean> {
	const result = await db
		.update(userTable)
		.set({ deleted_at: new Date() })
		.where(and(eq(userTable.id, id), isNull(userTable.deleted_at)))
		.returning({ id: userTable.id });

	return result.length > 0;
}

/**
 * Update base user information
 */
export async function updateBaseUser(
	id: number,
	userData: {
		email?: string;
		first_name?: string;
		middle_name?: string | null;
		last_name?: string | null;
		phone?: number;
	}
): Promise<User | null> {
	const [updatedUser] = await db
		.update(userTable)
		.set({
			...userData,
			updated_at: new Date(),
		})
		.where(and(eq(userTable.id, id), isNull(userTable.deleted_at)))
		.returning();

	return updatedUser || null;
}

/**
 * Get all users by role
 */
export async function getUsersByRole(role: Role): Promise<User[]> {
	const users = await db
		.select()
		.from(userTable)
		.where(and(eq(userTable.role, role), isNull(userTable.deleted_at)));

	return users;
}

/**
 * Verify password
 */
export async function verifyPassword(
	plainPassword: string,
	hashedPassword: string
): Promise<boolean> {
	return compare(plainPassword, hashedPassword);
}
