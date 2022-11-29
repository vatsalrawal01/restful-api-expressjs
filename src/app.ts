import * as dotenv from 'dotenv';
dotenv.config({path: `${process.cwd()}/.env.${process.env.NODE_ENV}`});
import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
import db from './db/models';
import {logger} from './middlewares/logger.middleware';
import {errorResponse} from './utils';
require('express-async-errors');

const port: number = +process.env.port;
const host: string = process.env.host;

const app: Express = express();

const shouldCompress = (req: Request, res: Response) => {
	if (req.headers['x-no-compression']) {
		// don't compress responses with this request header
		return false;
	}

	// fallback to standard filter function
	return compression.filter(req, res);
};
app.use(compression({filter: shouldCompress}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

db.sequelize.connect().then().catch(() => {
	logger.error('\x1b[31m', `Can't connect to Postgres Database.`);
});

routes(app);

app.use(async (err, req, res, next) => {
	logger.error(err.message);
	logger.debug(err.stack);
	const {statusCode, body} = errorResponse(err);
	res.status(statusCode).json({error: {status: statusCode, message: body}});
});


app.listen(port, host, () => {
	logger.info(`Server listing at http://${host}:${port}`);
});
