import {Express} from 'express';
import {
	createUserHandler, fetchUsersHandler,
	loginUserHandler,
	logoutUserHandler,
	refreshTokenHandler
} from './controllers/user.controller';
import {
	createPostHandler,
	deletePostHandler,
	fetchPostHandler,
	fetchPostsHandler,
	updatePostHandler
} from './controllers/post.controller';


export default (app: Express) => {
	app.post('/api/user/refreshToken', refreshTokenHandler);

	app.post('/api/user/login', loginUserHandler);
	app.post('/api/user/logout', logoutUserHandler);

	app.post('/api/user', createUserHandler);
	app.get('/api/user', fetchUsersHandler);


	app.post('/api/post', createPostHandler);
	app.get('/api/post', fetchPostsHandler);
	app.get('/api/post/:postId', fetchPostHandler);
	app.put('/api/post/:postId', updatePostHandler);
	app.delete('/api/post/:postId', deletePostHandler);
}
