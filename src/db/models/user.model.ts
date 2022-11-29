import {Model} from 'sequelize';
import {PostgresTable} from '../../constants';
import * as bcrypt from 'bcrypt';

const saltWorkFactor: number = +process.env.salt_work_factor;

interface UserAttributes {
	id: number;
	email: string;
	name: string;
	password: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
	class User extends Model<UserAttributes> implements UserAttributes {
		id: number;
		email: string;
		name: string;
		password: string;
	}


	User.init({
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'User',
		tableName: PostgresTable.USER_TABLE,
		hooks: {
			beforeCreate: async (user) => {
				if (user.password) {
					const salt = bcrypt.genSaltSync(saltWorkFactor, 'a');
					user.password = bcrypt.hashSync(user.password, salt);
				}
			},
			beforeUpdate: async (user) => {
				if (user.password) {
					const salt = bcrypt.genSaltSync(saltWorkFactor, 'a');
					user.password = bcrypt.hashSync(user.password, salt);
				}
			}
		}
	});
	return User;
};
