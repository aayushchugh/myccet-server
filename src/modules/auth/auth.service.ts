import { User } from "@prisma/client";
import { compare } from "bcrypt";
import { signJwtTokenUtil } from "../../common/utils/jwt.util";

/**
 * Check if the password is correct
 *
 * @param password hashed password
 * @param user the user object from database
 */
export const checkUserPasswordService = async (
	password: string,
	user: User
) => {
	return await compare(password, user.password);
};

/**
 * Generates a jwt token for the user
 * @param user the user from database
 */
export const signAccessTokenService = (user: User) => {
	return signJwtTokenUtil({ userId: user.id }, { expiresIn: "1d" });
};
