import {DataTypes, Sequelize} from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

class SequelizeService {
	private static instance: SequelizeService;
	private readonly sequelize: any;
	private isAuthenticated: boolean;

	private db: any = {};
	private basename = path.basename(__filename);

	constructor() {
		this.sequelize = new Sequelize(process.env.PG_CONNECTION_STRING, {
			pool: {
				/*
				 * Lambda functions process one request at a time but your code may issue multiple queries
				 * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
				 * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
				 * be executed in parallel rather than serialized. Careful with executing too many queries in
				 * parallel per Lambda function execution since that can bring down your database with an
				 * excessive number of connections.
				 *
				 * Ideally you want to choose a `max` number where this holds true:
				 * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
				 */
				max: 2,
				/*
				 * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
				 * in the event of a Lambda function timeout.
				 */
				min: 0,
				/*
				 * Set this value to 0 so connections are eligible for cleanup immediately after they're
				 * returned to the pool.
				 */
				idle: 1000,
				// Choose a small enough value that fails fast if a connection takes too long to be established.
				acquire: 60000,
				/*
				 * Ensures the connection pool attempts to be cleaned up automatically on the next Lambda
				 * function invocation, if the previous invocation timed out.
				 */
				evict: 120000
			},
			logging: false
		});
		this.loadModels();
	}

	async connect() {
		if (!this.isAuthenticated) {
			this.sequelize
				.authenticate()
				.then(() => {
					console.debug('Database connection has been established successfully.');
				})
				.catch((err: any) => {
					console.error('Unable to connect to the database:', err);
					process.exit(2);
				});
			// await this.sequelize.sync({alter: true, force: true});
			this.isAuthenticated = true;
		} else {
			// restart connection pool to ensure connections are not re-used across invocations
			this.sequelize.connectionManager.initPools();

			// restore `getConnection()` if it has been overwritten by `close()`
			if (this.sequelize.connectionManager.hasOwnProperty("getConnection")) {
				delete this.sequelize.connectionManager.getConnection;
			}
		}
	}

	async disconnect() {
		await this.sequelize.connectionManager.close();
	};

	getSequelize(): any {
		return this.sequelize;
	}

	getDB(): any {
		return this.db;
	}

	loadModels() {
		fs.readdirSync(__dirname)
			.filter((file: string) => {
				return (file.indexOf('.') !== 0) && (file !== this.basename) && (file.slice(-9) === '.model.js'
					|| file.slice(-9) === '.model.ts');
			})
			.forEach((file: any) => {
				const model = require(path.join(__dirname, file))(this.sequelize, DataTypes);
				this.db[model.name] = model;
			});

		Object.keys(this.db).forEach(modelName => {
			if (this.db[modelName].associate) {
				this.db[modelName].associate();
			}
		});
	}

	// re-use the sequelize instance across invocations to improve performance
	static getInstance(): SequelizeService {
		if (!SequelizeService.instance) {
			SequelizeService.instance = new SequelizeService();
		}
		return SequelizeService.instance;
	}
}

const sequelizeService: SequelizeService = SequelizeService.getInstance();
const db = sequelizeService.getDB();
db.sequelize = sequelizeService;
export default db;
