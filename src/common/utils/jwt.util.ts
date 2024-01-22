import { sign, verify, SignOptions } from "jsonwebtoken";

const accessTokenPrivateKey = process.env.ACCESS_TOKEN_PRIVATE_KEY;
const accessTokenPublicKey = process.env.ACCESS_TOKEN_PUBLIC_KEY;

/**
 * Sign a jwt token
 * @param payload they payload to sign
 * @returns signed jwt token
 */
export const signJwtTokenUtil = (payload: any, options?: SignOptions) => {
	return sign(payload, accessTokenPrivateKey, {
		algorithm: "RS256",
		...options,
	});
};

/**
 * Verify a jwt token
 * @param token JWT token to verify
 */
export const verifyJwtTokenUtil = (token: string) => {
	return verify(token, accessTokenPublicKey, {
		algorithms: ["RS256"],
	});
};
