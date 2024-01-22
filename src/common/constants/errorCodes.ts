enum ErrorCodes {
	/**
	 * Request body does not match zod schema
	 */
	INVALID_REQUEST_BODY = "INVALID_REQUEST_BODY",

	/**
	 * User does not exist in database
	 */
	USER_NOT_FOUND = "USER_NOT_FOUND",

	/**
	 * User password is incorrect
	 */
	USER_INVALID_CREDENTIALS = "USER_INVALID_CREDENTIALS",

	/**
	 * There is some problem with the server
	 */
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export default ErrorCodes;
