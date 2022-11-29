import {Model} from 'sequelize';
import db from '../models';
import {BadRequestException, ResourceNotFoundException} from '../../utils';
import {Post} from '../../entities/post.interface';
import {PostCreateRequest} from '../../entities/requests';
import {PostFilterCriteria, QueryOptions} from '../../entities';

export class PostDao {

	constructor() {
	}

	async createPost(request: PostCreateRequest, userId: number): Promise<Post> {
		const result: Model = await db.Post.create({
			title: request.title,
			description: request.description,
			userId
		});
		return PostDao.convertToEntity(result);
	}

	async fetchPosts(queryOptions: QueryOptions<PostFilterCriteria> = {}): Promise<Post[]> {
		const models: Model[] = await db.Post.findAll({
			where: {
				...PostDao.getFilterClause(queryOptions.filterCriteria)
			},
			attributes: queryOptions.attributes
		});
		return models.map((model: Model) => PostDao.convertToEntity(model));
	}

	async fetchPost(postId: number, queryOptions: QueryOptions<PostFilterCriteria> = {}): Promise<Post> {
		const model: Model = await this.findOne(postId, queryOptions);
		return PostDao.convertToEntity(model);
	}

	async findOne(postId: number, queryOptions: QueryOptions<PostFilterCriteria> = {}): Promise<Model> {
		const model: Model = await db.Post.findOne({
			where: {
				id: postId,
				...PostDao.getFilterClause(queryOptions.filterCriteria)
			},
			attributes: queryOptions.attributes
		});
		if (!model) {
			throw new ResourceNotFoundException(`Post ${postId} does not exist`);
		}
		return model;
	}

	async update(post: any): Promise<Post> {
		const updateInfo: [affectedCount: number, affectedRows: Model[]] = await db.Post.update(post,
			{
				where: {id: post.id},
				returning: true
			});
		if (updateInfo[0] !== 1) {
			throw new BadRequestException(
				`Error encountered while updating the post ${post.id}`);
		}
		return PostDao.convertToEntity(updateInfo[1][0]);
	}

	async delete(postId: number): Promise<Post> {
		const model: Model = await db.Post.findByPk(postId);
		await model.destroy();
		return PostDao.convertToEntity(model);
	}

	static convertToEntity(model: Model): Post {
		return JSON.parse(JSON.stringify(model));
	}

	static getFilterClause(criteria: PostFilterCriteria = {}): any {
		const whereClause: any = {};
		if (criteria.id) {
			whereClause.id = criteria.id;
		}
		if (criteria.userId) {
			whereClause.userId = criteria.userId;
		}
		return whereClause;
	}
}
