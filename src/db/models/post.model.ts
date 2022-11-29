import {Model} from 'sequelize';
import {PostgresTable} from '../../constants';

interface PostAttributes {
	id: number;
	userId: number;
	title: string;
	description: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
	class Post extends Model<PostAttributes> implements PostAttributes {
		id: number;
		userId: number;
		title: string;
		description: string;
	}


	Post.init({
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
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'Post',
		tableName: PostgresTable.POST_TABLE
	});
	return Post;
};
