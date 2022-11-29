import {Model} from 'sequelize';
import {PostgresTable} from '../../constants';

interface SessionAttributes {
	id: number;
	userId: number;
	authToken: string;
	refreshToken: string;
	valid: boolean;
	userAgent: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
	class Session extends Model<SessionAttributes> implements SessionAttributes {
		id: number;
		userId: number;
		authToken: string;
		refreshToken: string;
		valid: boolean;
		userAgent: string;
	}

	Session.init({
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		authToken: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		refreshToken: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		valid: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		userAgent: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		sequelize,
		modelName: 'Session',
		tableName: PostgresTable.SESSION_TABLE
	});
	return Session;
};
