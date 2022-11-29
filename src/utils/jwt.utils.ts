import jwt from "jsonwebtoken";

export const isAuthorized = (token: string) => {
	try {
		const data = jwt.verify(token, process.env.access_token_private_key);
		return {valid: true, expired: false, data};
	} catch (error) {
		return {
			valid: false,
			expired: error.message === "jwt expired",
			data: null,
		};
	}
};


export const isAuthorizedRefreshToken = (token: string) => {
	try {
		const data = jwt.verify(token, process.env.refresh_token_private_key);
		return {valid: true, expired: false, data};
	} catch (error) {
		return {
			valid: false,
			expired: error.message === "jwt expired",
			data: undefined,
		};
	}
};
