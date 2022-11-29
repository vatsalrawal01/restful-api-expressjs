import {IsDefined, IsString} from 'class-validator';

export class UserCreateRequest {
	@IsDefined()
	@IsString()
	email: string;

	@IsDefined()
	@IsString()
	name: string;

	@IsDefined()
	@IsString()
	password: string;
}

export class UserLoginRequest {
	@IsDefined()
	@IsString()
	email: string;

	@IsDefined()
	@IsString()
	password: string;
}

export class RefreshTokenRequest {
	@IsDefined()
	@IsString()
	refreshToken: string;
}

export class PostCreateRequest {
	@IsDefined()
	@IsString()
	title: string;

	@IsDefined()
	@IsString()
	description: string;
}

export class PostUpdateRequest {
	@IsString()
	title: string;

	@IsString()
	description: string;
}


export class SessionCreateRequest {
	userId: number;
	userAgent: string;
	refreshToken: string;
	authToken: string;
}
