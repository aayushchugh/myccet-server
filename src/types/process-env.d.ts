declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: number;
			DATABASE_URL: string;
			ACCESS_TOKEN_PRIVATE_KEY: string;
			ACCESS_TOKEN_PUBLIC_KEY: string;
		}
	}
}

export {};
