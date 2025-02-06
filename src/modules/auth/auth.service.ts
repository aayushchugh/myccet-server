import { Session, sessionTable } from "../../db/schema/session";
import { sha256 } from "@oslojs/crypto/sha2";
import { User, userTable } from "../../db/schema/user";
import db from "../../db";
import { eq } from "drizzle-orm";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: number
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id: userId,
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};

	await db.insert(sessionTable).values(session);
	return session;
}

export async function validateSessionToken(
	token: string
): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ user: userTable, session: sessionTable })
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.user_id, userTable.id))
		.where(eq(sessionTable.id, sessionId));

	if (result.length < 1) {
		return { session: null, user: null };
	}

	const { user, session } = result[0];
	if (Date.now() >= session.expires_at.getTime()) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}

	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(sessionTable)
			.set({ expires_at: session.expires_at })
			.where(eq(sessionTable.id, session.id));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
