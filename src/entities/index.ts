import {FindAttributeOptions, Order} from 'sequelize';

export interface FilterCriteria {
}

export interface QueryOptions<T> {
	attributes?: FindAttributeOptions;
	filterCriteria?: T;
	order?: Order;
	limit?: number;
}

export interface UserFilterCriteria extends FilterCriteria {
	id?: number;
	email?: string;
	password?: string;
}

export interface PostFilterCriteria extends FilterCriteria {
	id?: number;
	userId?: number;
}

export interface SessionFilterCriteria extends FilterCriteria {
	userId?: number;
	refreshToken?: string;
	authToken?: string;
}


export interface JWTTokenPayload {
	userId: number,
	name: string,
	email: string
}
