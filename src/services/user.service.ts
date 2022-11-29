import {UserDao} from '../db/dao/user.dao';
import {User} from '../entities/user.interface';
import {RefreshTokenRequest, UserCreateRequest, UserLoginRequest} from '../entities/requests';
import jwt from 'jsonwebtoken';
import {SessionDao} from '../db/dao/session.dao';
import express from 'express';
import {JWTTokenPayload} from '../entities';
import {Session} from '../entities/session.interface';
import {AccessDeniedException, isAuthorized, isAuthorizedRefreshToken, UnauthorizedException} from '../utils';

export class UserService {
	private readonly userDao: UserDao;
	private readonly sessionDao: SessionDao;

	constructor() {
		this.userDao = new UserDao();
		this.sessionDao = new SessionDao();
	}

	async createUser(request: UserCreateRequest): Promise<User> {
		return this.userDao.createUser(request);
	}

	async fetchUsers(): Promise<User[]> {
		return this.userDao.fetchUsers();
	}

	async loginUser(request: UserLoginRequest, userAgent: string): Promise<any> {
		const user: User = await this.userDao.validateLogin({
			filterCriteria: {
				email: request.email,
				password: request.password
			}
		});

		const jwtPayload = {
			userId: user.id,
			name: user.name,
			email: user.email
		};

		const token: string = jwt.sign(jwtPayload, process.env.access_token_private_key,
			{expiresIn: process.env.access_token_expires_in});
		const refreshToken: string = jwt.sign(jwtPayload, process.env.refresh_token_private_key,
			{expiresIn: process.env.refresh_token_expires_in});

		await this.sessionDao.createSession({
			userId: user.id, authToken: token,
			userAgent, refreshToken
		});

		return {token, refreshToken};
	}

	async logoutUser(request: RefreshTokenRequest, allSessions: boolean): Promise<any> {
		const data: JWTTokenPayload = this.validateRefreshToken(request.refreshToken);
		if (!data) {
			throw new Error('Error encounter while validate refresh token');
		}
		const principal: User = await this.userDao.fetchUser({
			filterCriteria: {
				email: data.email
			}
		});

		const filterCriteria = {userId: principal.id};
		if (!allSessions) {
			filterCriteria["refreshToken"] = request.refreshToken;
		}

		const sessions: Session[] = await this.sessionDao.fetchSessions({filterCriteria});

		for (const session of sessions) {
			await this.sessionDao.delete(session.id);
		}
		return sessions;
	}


	async refreshToken(request: RefreshTokenRequest): Promise<any> {
		const data: JWTTokenPayload = this.validateRefreshToken(request.refreshToken);
		if (!data) {
			throw new Error('Error encounter while validate refresh token');
		}
		const principal: User = await this.userDao.fetchUser({
			filterCriteria: {
				email: data.email
			}
		});

		const sessions: Session[] = await this.sessionDao.fetchSessions({
			filterCriteria: {
				userId: principal.id,
				refreshToken: request.refreshToken
			}
		});

		if (sessions.length !== 1) {
			throw new UnauthorizedException(
				"You need to login with credentials, The incoming refresh token has expired");
		}


		const jwtPayload: JWTTokenPayload = {
			userId: principal.id,
			name: principal.name,
			email: principal.email
		};

		const token: string = jwt.sign(jwtPayload, process.env.access_token_private_key,
			{expiresIn: process.env.access_token_expires_in});

		const session: Session = sessions[0];
		session.authToken = token;
		await this.sessionDao.update(session);

		return {token, refreshToken: request.refreshToken};
	}

	async getPrincipalFromToken(req: express.Request): Promise<User> {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) {
			throw new AccessDeniedException(undefined);
		}
		const data: any = isAuthorized(token);
		if (data.expired) {
			throw new UnauthorizedException("The incoming token has expired");
		}
		if (!data.valid) {
			throw new UnauthorizedException("The incoming token has invalid");
		}
		const principal: User = await this.userDao.fetchUser({
			filterCriteria: {
				email: data.data.email
			}
		});
		const sessions: Session[] = await this.sessionDao.fetchSessions({
			filterCriteria: {
				userId: principal.id,
				authToken: token
			}
		});
		if (sessions.length !== 1) {
			throw new UnauthorizedException("The incoming token has expired");
		}
		return principal;
	}

	private validateRefreshToken(refreshToken: string): JWTTokenPayload {
		const data: any = isAuthorizedRefreshToken(refreshToken);
		if (data.expired) {
			throw new UnauthorizedException(
				"You need to login with credentials, The incoming refresh token has expired");
		}
		if (!data.valid) {
			throw new UnauthorizedException("The incoming refresh token has invalid");
		}
		return data.data;
	}

}
