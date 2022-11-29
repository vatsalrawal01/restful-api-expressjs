import {Model} from 'sequelize';
import db from '../models';
import {BadRequestException, ResourceNotFoundException} from '../../utils';
import {QueryOptions, SessionFilterCriteria} from '../../entities';
import {Session} from '../../entities/session.interface';
import {SessionCreateRequest} from '../../entities/requests';

export class SessionDao {

	constructor() {
	}

	async createSession(request: SessionCreateRequest): Promise<Session> {
		const model: Model = await db.Session.create({
			userId: request.userId,
			userAgent: request.userAgent,
			refreshToken: request.refreshToken,
			authToken: request.authToken
		});
		return SessionDao.convertToEntity(model);
	}

	async fetchSessions(queryOptions: QueryOptions<SessionFilterCriteria> = {}): Promise<Session[]> {
		const models: Model[] = await db.Session.findAll({
			where: SessionDao.getFilterClause(queryOptions.filterCriteria),
			attributes: queryOptions.attributes,
			order: queryOptions.order
		});
		return models.map((model: Model) => SessionDao.convertToEntity(model));
	}

	async fetchSession(queryOptions: QueryOptions<SessionFilterCriteria> = {}): Promise<Session> {
		const model: Model = await this.findOne(queryOptions);
		return SessionDao.convertToEntity(model);
	}

	async findOne(queryOptions: QueryOptions<SessionFilterCriteria> = {}): Promise<Model> {
		const model: Model = await db.Session.findOne({
			where: {
				...SessionDao.getFilterClause(queryOptions.filterCriteria)
			},
			attributes: queryOptions.attributes
		});
		if (!model) {
			throw new ResourceNotFoundException(`Session does not exist`);
		}
		return model;
	}

	async update(session: any): Promise<Session> {
		const updateInfo: [affectedCount: number, affectedRows: Model[]] = await db.Session.update(session,
			{
				where: {id: session.id},
				returning: true
			});
		if (updateInfo[0] !== 1) {
			throw new BadRequestException(
				`Error encountered while updating the session ${session.id}`);
		}
		return SessionDao.convertToEntity(updateInfo[1][0]);
	}

	async delete(sessionId: number): Promise<Session> {
		const model: Model = await db.Session.findByPk(sessionId);
		await model.destroy();
		return SessionDao.convertToEntity(model);
	}

	static convertToEntity(model: Model): Session {
		return JSON.parse(JSON.stringify(model));
	}

	static getFilterClause(criteria: SessionFilterCriteria = {}): any {
		const whereClause: any = {};
		if (criteria.userId) {
			whereClause.userId = criteria.userId;
		}
		if (criteria.refreshToken) {
			whereClause.refreshToken = criteria.refreshToken;
		}
		if (criteria.authToken) {
			whereClause.authToken = criteria.authToken;
		}
		return whereClause;
	}
}
