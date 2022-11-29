import {UserDao} from '../db/dao/user.dao';
import {PostDao} from '../db/dao/post.dao';
import {PostCreateRequest, PostUpdateRequest} from '../entities/requests';
import {AccessDeniedException} from '../utils';
import {User} from '../entities/user.interface';
import {Post} from '../entities/post.interface';

export class PostService {
	private readonly userDao: UserDao;
	private readonly postDao: PostDao;

	constructor() {
		this.userDao = new UserDao();
		this.postDao = new PostDao();
	}

	async createPost(principal: User, request: PostCreateRequest): Promise<Post> {
		return await this.postDao.createPost(request, principal.id);
	}

	async fetchPosts(): Promise<Post[]> {
		return await this.postDao.fetchPosts();
	}

	async fetchPost(principal: User, postId: number): Promise<Post> {
		return await this.postDao.fetchPost(postId);
	}

	async updatePost(principal: User, postId: number, request: PostUpdateRequest): Promise<Post> {
		const post: Post = await this.postDao.fetchPost(postId);
		if (post.userId !== principal.id) {
			throw new AccessDeniedException("Access denied. Cannot edit other post's");
		}
		if (request.title) {
			post.title = request.title;
		}
		if (request.description) {
			post.description = request.description;
		}
		return await this.postDao.update(post);
	}

	async deletePost(principal: User, postId: number): Promise<Post> {
		const post: Post = await this.postDao.fetchPost(postId);
		if (post.userId !== principal.id) {
			throw new AccessDeniedException("Access denied. Cannot delete other post's");
		}
		return await this.postDao.delete(postId);
	}
}
