import { camelToSnakeCase, camelToUpperSnakeCase, snakeToCamelCase } from './string';


export const hasNullValue = (obj: Record<string, any>): boolean => {
	return Object.values(obj).some((value) => value === null);
};

export const hasEmptyValue = (obj: Record<string, any>): boolean => {
	return Object.values(obj).some((value) => value === null || value === undefined || value === '');
};

export type Cleaned<T> = {
	[K in keyof T]: T[K] | undefined
};
export function cleanFormData<T extends object>(data: T): Cleaned<T> {
	const copy = { ...data } as Cleaned<T>;

	(Object.entries(data) as [keyof T, T[keyof T]][])
		.forEach(([key, value]) => {
			if (value === '') {
				copy[key] = undefined;
			}
		});

	return copy;
}

export const convertKeys = ( obj: any, transform: (key: string) => string): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => convertKeys(item, transform));
	}

	if (obj !== null && typeof obj === 'object') {
		return Object.entries(obj).reduce((acc, [key, value]) => {
			const newKey = transform(key);
			acc[newKey] = convertKeys(value, transform);
			return acc;
		}, {} as Record<string, any>);
	}

	return obj;
};

export const camelToSnakeObject = (obj: any) =>
	convertKeys(obj, camelToSnakeCase);

export const camelToUpperSnakeObject = (obj: any) =>
	convertKeys(obj, camelToUpperSnakeCase);

export const snakeToCamelObject = (obj: any) =>
	convertKeys(obj, snakeToCamelCase);


export type CleanedEmptyString<T> = {
	[K in keyof T]: T[K] | null
};
export function cleanEmptyString<T extends object>(data: T): CleanedEmptyString<T> {
	const copy = { ...data } as CleanedEmptyString<T>;

	(Object.entries(data) as [keyof T, T[keyof T]][])
		.forEach(([key, value]) => {
			if (value === '') {
				copy[key] = null;
			}
		});

	return copy;
}