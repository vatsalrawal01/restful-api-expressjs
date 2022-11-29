import {ClassConstructor, plainToInstance} from 'class-transformer';
import {isEmpty, validate, ValidationError} from 'class-validator';
import {BadRequestException} from './response.util';
import {ApiConstant, RegexConstant} from '../constants';

export const validateRequest = async <T, V>(cls: ClassConstructor<T>, plain: V): Promise<T> => {
	if (isEmpty(plain)) {
		throw new BadRequestException('Request payload is required');
	}
	if (typeof plain === 'string') {
		try {
			plain = JSON.parse(plain);
		} catch (e: any) {
			throw new BadRequestException('Unable to parse payload');
		}
	}
	const request: any = plainToInstance(cls, plain);
	return validate(request, {
		skipMissingProperties: true,
	}).then((errors) => {
		if (errors.length > 0) {
			let errorTexts: string[] = getErrorMsg(errors);
			// throw new BadRequestException(errorTexts.join('. '));
			throw new BadRequestException(errorTexts[0]);
		}
		return request;
	});
};

const getErrorMsg = (errors: ValidationError[], errorTexts?: string[]): string[] => {
	if (!errorTexts) {
		errorTexts = [];
	}
	if (errors && errors.length > 0) {
		for (const e of errors) {
			if (e.constraints) {
				errorTexts.push(Object.values(e.constraints)[0]);
			}
			getErrorMsg(e.children, errorTexts);
		}
	}
	return errorTexts;
};

export const _validateParam = (params: any, param: string, isRequired: boolean, format: string | RegExp): string => {
	const value: string = params ? params[param] : null;
	if (value) {
		if (format && !validateStringPattern(value, format)) {
			throw new BadRequestException(`${ApiConstant.INVALID_PARAM} : ${param}`);
		}
	} else {
		if (isRequired) {
			throw new BadRequestException(`${ApiConstant.MISSING_PARAM} : ${param}`);
		}
	}
	return value;
};

export const _validateSerialIdParam = (params: any, param: string, isRequired: boolean = true): number => {
	const value: any = params ? params[param] : undefined;
	if (value) {
		if (!validateStringPattern(value, RegexConstant.SERIAL_ID_PATTERN)) {
			throw new BadRequestException(`${ApiConstant.INVALID_PARAM} : ${param}`);
		}
	} else {
		if (isRequired) {
			throw new BadRequestException(`${ApiConstant.MISSING_PARAM} : ${param}`);
		}
	}
	return !isNaN(value) ? +value : undefined;
};
export const validateStringPattern = (str: string, format: string | RegExp): boolean => {
	if (!str) {
		return false;
	}
	const regex = new RegExp(format);
	return regex.test(str);
};
