export abstract class PostgresTable {
	static USER_TABLE = 'users';
	static POST_TABLE = 'posts';
	static SESSION_TABLE = 'sessions';
}

export abstract class ApiConstant {
	static MISSING_PARAM = 'Missing param';
	static INVALID_PARAM = 'Invalid param';

	static POST_ID = 'postId';
	static ALL = 'all';
}

export abstract class RegexConstant {
	static SERIAL_ID_PATTERN = /^\d{1,10}$/i;
}
