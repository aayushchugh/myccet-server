import { randomBytes } from "crypto";
import db from "../../db";
import { sessionTable } from "../../db/schema/session";
import { getUserByEmail, verifyPassword } from "../../services/user.service";
import { eq } from "drizzle-orm";

/**
 * Generate a random session token
 */
export function generateSessionToken(): string {
	return randomBytes(64).toString("hex");
}

/**
 * Create a new session for a user
 */
export async function createSession(
	token: string,
	userId: number
): Promise<void> {
	const sessionId = randomBytes(32).toString("hex");

	await db.insert(sessionTable).values({
		id: sessionId,
		token,
		user_id: userId,
		expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
	});
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
	// Find user by email
	const user = await getUserByEmail(email);

	if (!user) {
		return { success: false, error: "user_not_found" };
	}

	// Verify password
	const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
		return { success: false, error: "invalid_password" };
	}

	// Generate session token
	const sessionToken = generateSessionToken();

	// Create session
	await createSession(sessionToken, user.id);

	return {
		success: true,
		user,
		sessionToken,
	};
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string) {
	const [session] = await db
		.select()
		.from(sessionTable)
		.where(eq(sessionTable.token, token));

	return session || null;
}

/**
 * Delete session
 */
export async function deleteSession(token: string): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.token, token));
}
