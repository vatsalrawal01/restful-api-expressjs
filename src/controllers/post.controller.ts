import {Request, Response} from 'express';
import {UserService} from '../services/user.service';
import {PostCreateRequest, PostUpdateRequest} from '../entities/requests';
import {PostService} from '../services/post.service';
import {ApiConstant} from '../constants';
import {User} from '../entities/user.interface';
import {Post} from '../entities/post.interface';
import {_validateSerialIdParam, validateRequest} from '../utils';

const userService: UserService = new UserService();
const postService: PostService = new PostService();

export const createPostHandler = async (req: Request, res: Response) => {
	const principal: User = await userService.getPrincipalFromToken(req);
	const request: PostCreateRequest = await validateRequest(PostCreateRequest, req.body);
	const post: Post = await postService.createPost(principal, request);
	return res.send(post);
};

export const fetchPostsHandler = async (req: Request, res: Response) => {
	await userService.getPrincipalFromToken(req);
	const posts: Post[] = await postService.fetchPosts();
	return res.send(posts);
};

export const fetchPostHandler = async (req: Request, res: Response) => {
	const principal: User = await userService.getPrincipalFromToken(req);
	const postId = _validateSerialIdParam(req.params, ApiConstant.POST_ID);
	const post: Post = await postService.fetchPost(principal, postId);
	return res.send(post);
};

export const updatePostHandler = async (req: Request, res: Response) => {
	const principal: User = await userService.getPrincipalFromToken(req);
	const request: PostUpdateRequest = await validateRequest(PostUpdateRequest, req.body);
	const postId = _validateSerialIdParam(req.params, ApiConstant.POST_ID);
	const post: Post = await postService.updatePost(principal, postId, request);
	return res.send(post);
};

export const deletePostHandler = async (req: Request, res: Response) => {
	const principal: User = await userService.getPrincipalFromToken(req);
	const postId = _validateSerialIdParam(req.params, ApiConstant.POST_ID);
	const post: Post = await postService.deletePost(principal, postId);
	return res.send(post);
};
