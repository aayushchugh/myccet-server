import { Prisma, User } from "@prisma/client";
import prisma from "../../prisma/prisma";
import loggerUtil from "../../common/utils/logger.util";

/**
 * Create new user in database
 * @param payload user data
 * @returns created user
 */
export const createUserService = async (payload: Prisma.UserCreateInput) => {
	const user = await prisma.user.create({
		data: payload,
	});

	loggerUtil.info(`User created with id: ${user.id}`);

	return user;
};

/**
 * Get user by email
 * @param email emailId of the user
 */
export const getUserByEmailService = async (email: User["email"]) => {
	return await prisma.user.findUnique({
		where: {
			email,
		},
	});
};
