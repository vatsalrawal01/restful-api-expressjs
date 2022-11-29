export class BadRequestException extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, BadRequestException.prototype);
	}
}

export class UnauthorizedException extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, UnauthorizedException.prototype);
	}
}

export class AccessDeniedException extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, AccessDeniedException.prototype);
	}
}

export class ResourceNotFoundException extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
	}
}

export class ResourceAlreadyExistsException extends Error {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, ResourceAlreadyExistsException.prototype);
	}
}

export const errorResponse = (err: any): { statusCode: number, body: any } => {
	let statusCode: number = 500;
	let body: any = 'Something went wrong. Please contact support.';

	if (err instanceof BadRequestException) {
		statusCode = 400;
		body = err.message;
	} else if (err instanceof UnauthorizedException) {
		statusCode = 401;
		body = err.message || 'Unauthorized';
	} else if (err instanceof AccessDeniedException) {
		statusCode = 403;
		body = err.message || 'Access denied';
	} else if (err instanceof ResourceNotFoundException) {
		statusCode = 404;
		body = err.message || 'Resource not found';
	} else if (err instanceof ResourceAlreadyExistsException) {
		statusCode = 409;
		body = err.message || 'Resource already exist';
	}
	return {statusCode, body};
};
