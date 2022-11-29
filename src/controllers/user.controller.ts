import {Request, Response} from 'express';
import {UserService} from '../services/user.service';
import {RefreshTokenRequest, UserCreateRequest, UserLoginRequest} from '../entities/requests';
import {_validateParam, validateRequest} from '../utils';
import {ApiConstant} from '../constants';
import {User} from '../entities/user.interface';

const userService: UserService = new UserService();

export const refreshTokenHandler = async (req: Request, res: Response) => {
	const request: RefreshTokenRequest = await validateRequest(RefreshTokenRequest, req.body);
	const token = await userService.refreshToken(request);
	return res.send(token);
};
export const loginUserHandler = async (req: Request, res: Response) => {
	const request: UserLoginRequest = await validateRequest(UserLoginRequest, req.body);
	const tokens = await userService.loginUser(request, req.headers['user-agent']);
	return res.send(tokens);
};

export const logoutUserHandler = async (req: Request, res: Response) => {
	await userService.getPrincipalFromToken(req);
	const request: RefreshTokenRequest = await validateRequest(RefreshTokenRequest, req.body);
	const allSessions = _validateParam(req.query, ApiConstant.ALL, false, undefined);
	await userService.logoutUser(request, (allSessions === "true"));
	return res.send({msg: "Successfully logout"});
};

export const createUserHandler = async (req: Request, res: Response) => {
	const request: UserCreateRequest = await validateRequest(UserCreateRequest, req.body);
	const user: User = await userService.createUser(request);
	return res.send(user);
};

export const fetchUsersHandler = async (req: Request, res: Response) => {
	await userService.getPrincipalFromToken(req);
	const users: User[] = await userService.fetchUsers();
	return res.send(users);
};
