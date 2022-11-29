export interface Session {
	id: number;
	userId: number;
	refreshToken: string;
	authToken: string;
	valid: boolean;
	userAgent: string;
	createdAt: Date;
	updatedAt: Date;
}
