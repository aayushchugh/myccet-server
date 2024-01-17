import { Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma";
import loggerUtil from "../../utils/logger.util";

/**
 * Create new user in database
 * @param payload user data
 * @returns created user
 */
export const createUserService = async (payload: Prisma.UserCreateInput) => {
	const user = await prisma.user.create({
		data: payload,
	});

	loggerUtil.db(`User created with id: ${user.id}`);

	return user;
};
