import {User} from '../../entities/user.interface';
import {Model, UniqueConstraintError} from 'sequelize';
import db from '../models';
import * as bcrypt from 'bcrypt';
import {UserCreateRequest} from '../../entities/requests';
import {QueryOptions, UserFilterCriteria} from '../../entities';
import {BadRequestException, ResourceNotFoundException} from '../../utils';

export class UserDao {

	constructor() {
	}

	async createUser(request: UserCreateRequest): Promise<User> {
		try {
			const result: Model = await db.User.create({
				email: request.email,
				name: request.name,
				password: request.password
			});
			return UserDao.convertToEntity(result);
		} catch (err) {
			if (err instanceof UniqueConstraintError) {
				throw new BadRequestException(`Duplicate email: ${request.email}`);
			}
			throw err;
		}
	}

	async fetchUsers(queryOptions: QueryOptions<UserFilterCriteria> = {}): Promise<User[]> {
		const models: Model[] = await db.User.findAll({
			where: {
				...UserDao.getFilterClause(queryOptions.filterCriteria)
			},
			attributes: queryOptions.attributes
		});
		return models.map((model: Model) => UserDao.convertToEntity(model));
	}

	async fetchUser(queryOptions: QueryOptions<UserFilterCriteria> = {}): Promise<User> {
		const model: Model = await this.findOne(queryOptions);
		return UserDao.convertToEntity(model);
	}

	async findOne(queryOptions: QueryOptions<UserFilterCriteria> = {}): Promise<Model> {
		const model: Model = await db.User.findOne({
			where: {
				...UserDao.getFilterClause(queryOptions.filterCriteria)
			},
			attributes: queryOptions.attributes
		});
		if (!model) {
			throw new ResourceNotFoundException(`User does not exist`);
		}
		return model;
	}

	async validateLogin(queryOptions: QueryOptions<UserFilterCriteria> = {}): Promise<User> {
		const model: Model = await this.findOne(queryOptions);
		const user: User = UserDao.convertToEntity(model);
		if (!bcrypt.compareSync(queryOptions.filterCriteria.password, model.getDataValue('password'))) {
			throw new ResourceNotFoundException('Wrong credential');
		}
		return user;
	}

	static convertToEntity(model: Model): User {
		const user: User = JSON.parse(JSON.stringify(model));
		delete user.password;
		return user;
	}

	static getFilterClause(criteria: UserFilterCriteria = {}): any {
		const whereClause: any = {};
		if (criteria.id) {
			whereClause.id = criteria.id;
		}
		if (criteria.email) {
			whereClause.email = criteria.email;
		}
		return whereClause;
	}
}
