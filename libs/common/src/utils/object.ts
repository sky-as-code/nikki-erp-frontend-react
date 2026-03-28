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
